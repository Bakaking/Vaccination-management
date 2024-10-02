package mockProject.team3.Vaccination_20.service.impl;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import mockProject.team3.Vaccination_20.dto.vaccineDto.VaccineRequestDto1;
import mockProject.team3.Vaccination_20.dto.vaccineDto.VaccineResponseDto3;
import mockProject.team3.Vaccination_20.dto.vaccineDto.VaccineResponseDto4;
import mockProject.team3.Vaccination_20.dto.vaccineDto.VaccineResponseDto5;
import mockProject.team3.Vaccination_20.dto.vaccineTypeDto.VaccineTypeResponseDto4;
import mockProject.team3.Vaccination_20.exception.vaccine_exception.VaccineAlreadyExistsException;
import mockProject.team3.Vaccination_20.model.Vaccine;
import mockProject.team3.Vaccination_20.model.VaccineType;
import mockProject.team3.Vaccination_20.repository.VaccineRepository;
import mockProject.team3.Vaccination_20.repository.VaccineTypeRepository;
import mockProject.team3.Vaccination_20.service.VaccineService;
import mockProject.team3.Vaccination_20.utils.Status;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.hibernate.service.spi.ServiceException;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class VaccineServiceImpl implements VaccineService {
    @Autowired
    private VaccineRepository vaccineRepository;

    @Autowired
    private VaccineTypeRepository vaccineTypeRepository;

    @Autowired
    private ModelMapper modelMapper;

//    @PostConstruct
//    public void setupMapperVaccineTypeOfVaccineDto() {
//        modelMapper.addMappings(new PropertyMap<VaccineType, VaccineTypeResponseDto4>() {
//            @Override
//            protected void configure() {
//                map().setVaccineTypeName(source.getVaccineTypeName());
//            }
//        });
//    }

    @Override
    public int createVaccine(VaccineRequestDto1 vaccineRequestDto1) {
//        if (vaccineRepository.existsById(vaccineRequestDto1.getVaccineId())){
//            throw new VaccineAlreadyExistsException("Vaccine with ID " + vaccineRequestDto1.getVaccineId() + " already exists.");
//        }
        Vaccine vaccine = modelMapper.map(vaccineRequestDto1, Vaccine.class);
        try {
            VaccineType vaccineType = vaccineTypeRepository.findById(vaccineRequestDto1.getVaccineTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Vaccine Type not found"));
            vaccine.setVaccineType(vaccineType);
        } catch(Exception e) {
            return 0;
        }
        vaccineRepository.save(vaccine);
        return 1;
    }

    @Override
    public Page<VaccineResponseDto3> getVaccineListBySearchInput(String searchInput, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Vaccine> vaccines;
        if(searchInput.trim().isEmpty()) {
            vaccines = vaccineRepository.findAll(pageable);
        } else {
            vaccines = vaccineRepository.findBySearchInput(searchInput, pageable);
        }
        List<VaccineResponseDto3> vaccineDtos = modelMapper.map(vaccines.getContent(), new TypeToken<List<VaccineResponseDto3>>(){}.getType());
       	return new PageImpl<>(vaccineDtos, pageable, vaccines.getTotalElements());
    }

    @Override
    public VaccineResponseDto5 getVaccineById(String vaccineId) {
        try {
            return vaccineRepository.findById(vaccineId)
                    .map(vaccine -> modelMapper.map(vaccine, VaccineResponseDto5.class))
                    .orElse(null);
        } catch (Exception e) {
            throw new RuntimeException("Error occurred while fetching vaccine", e);
        }
    }

    @Override
    public int changeStatusVaccine(List<String> vaccineIds) {
        if (vaccineIds == null || vaccineIds.isEmpty()){
            System.out.println("no vaccine was selected");
            return 0;
        }
        try {
            for (String vaccineId : vaccineIds){
                Vaccine selectedVaccine = vaccineRepository.findById(vaccineId).get();
                if(selectedVaccine.getVaccineStatus() == Status.INACTIVE) {
                    System.out.println("Please select only vaccines with ACTIVE status");
                    return -1;
                }
            }
            for (String vaccineId : vaccineIds){
                Vaccine selectedVaccine = vaccineRepository.findById(vaccineId).get();
                selectedVaccine.setVaccineStatus(Status.INACTIVE);
                vaccineRepository.save(selectedVaccine);
            }
            if(vaccineIds.size() > 1) {
                return vaccineIds.size();
            }
            return 1;
        } catch (NoSuchElementException e) {
            System.out.println("could not find a vaccine with given vaccine IDs");
            return -2;
        } catch (RuntimeException e) {
            System.out.println("An unexpected error occurred: " + e.getMessage());
            return -3;
        }
    }

    @Override
    public void exportTemplate(HttpServletResponse response) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Import Template");

        Row headerRow = sheet.createRow(0);
        CellStyle headerStyle = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        headerStyle.setFont(font);

        String[] headers = {"Contraindication", "Indication", "Number of Injection", "Vaccine Origin", "Time Begin Next Injection", "Time End Next Injection", "Vaccine Usage", "Vaccine Name", "Status", "Vaccine Type"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=import_template.xlsx");

        ServletOutputStream outputStream = response.getOutputStream();
        workbook.write(outputStream);
        workbook.close();
        outputStream.close();
    }

    @Override
    public List<String> importVaccineFromExcel(MultipartFile file) throws IOException {
        InputStream inputStream = file.getInputStream();
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheetAt(0);

        List<Vaccine> vaccines = new ArrayList<>();
        List<String> notifications = new ArrayList<>(); // List to store notifications

        // Define the expected headers
        String[] expectedHeaders = {"Contraindication", "Indication", "Number of Injection", "Vaccine Origin", "Time Begin Next Injection", "Time End Next Injection", "Vaccine Usage", "Vaccine Name", "Status", "Vaccine Type"};

        // Validate header row
        Row headerRow = sheet.getRow(0);
        if (headerRow == null || headerRow.getLastCellNum() != expectedHeaders.length) {
            notifications.add("Header row is missing or does not match the template.");
            workbook.close();
            return notifications;
        }

        for (int i = 0; i < expectedHeaders.length; i++) {
            Cell cell = headerRow.getCell(i);
            if (cell == null || !expectedHeaders[i].equals(cell.getStringCellValue())) {
                notifications.add("Header mismatch at column " + (i + 1) + ". Expected: " + expectedHeaders[i]);
                workbook.close();
                return notifications;
            }
        }

        // Process data rows
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) {
                notifications.add("Row " + (i + 1) + " is empty.");
                continue;
            }

            Vaccine vaccine = new Vaccine();

            // Read and set fields from the row
            if (row.getCell(0) != null) {
                vaccine.setContraindication(row.getCell(0).getStringCellValue());
            }
            if (row.getCell(1) != null) {
                vaccine.setIndication(row.getCell(1).getStringCellValue());
            }
            if (row.getCell(2) != null) {
                vaccine.setNumberOfInjection((int) row.getCell(2).getNumericCellValue());
            }
            if (row.getCell(3) != null) {
                vaccine.setVaccineOrigin(row.getCell(3).getStringCellValue());
            }
            if (row.getCell(4) != null) {
                vaccine.setTimeBeginNextInjection(row.getCell(4).getLocalDateTimeCellValue().toLocalDate());
            }
            if (row.getCell(5) != null) {
                vaccine.setTimeEndNextInjection(row.getCell(5).getLocalDateTimeCellValue().toLocalDate());
            }
            if (row.getCell(6) != null) {
                vaccine.setVaccineUsage(row.getCell(6).getStringCellValue());
            }
            if (row.getCell(7) != null) {
                vaccine.setVaccineName(row.getCell(7).getStringCellValue());
            }
            if (row.getCell(8) != null) {
                try {
                    vaccine.setVaccineStatus(Status.valueOf(row.getCell(8).getStringCellValue().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    notifications.add("Invalid status at row " + (i + 1) + ". Expected 'ACTIVE' or 'INACTIVE'.");
                    continue;
                }
            }

            // Check for Vaccine Type
            if (row.getCell(9) != null) {
                System.out.println("checkpoint 1");
                String vaccineTypeId = row.getCell(9).getStringCellValue();
                VaccineType vaccineType = vaccineTypeRepository.findById(vaccineTypeId).orElse(null);
                System.out.println(vaccineType.getVaccineTypeId());
                if (vaccineType != null) {
                    System.out.println("checkpoint 2");
                    if (vaccineType.getVaccineTypeStatus() == Status.ACTIVE) {
                        System.out.println("checkpoint 3");
                        vaccine.setVaccineType(vaccineType);
                        vaccines.add(vaccine); // Add to vaccines list
                    } else {
                        System.out.println("checkpoint 4");
                        // Add a notification if vaccineTypeStatus is INACTIVE
                        notifications.add("Cannot add vaccine at row " + (i + 1) + " because the vaccine type is inactive.");
                    }
                } else {
                    System.out.println("checkpoint 5");
                    notifications.add("Cannot add vaccine at row " + (i + 1) + " because the vaccine type was not found.");
                }
            } else {
                System.out.println("checkpoint 6");
                notifications.add("Vaccine type is missing at row " + (i + 1) + ".");
            }
        }

        // Save all valid vaccines
        if (!vaccines.isEmpty()) {
            for(Vaccine vaccine : vaccines) {
                vaccineRepository.save(vaccine);
            }
            notifications.add("Successfully imported " + vaccines.size() + " vaccines.");
        }

        workbook.close();
        return notifications; // Return notifications to the controller
    }

    public List<VaccineResponseDto4> findAllVaccineName() {
        try {
            List<Vaccine> vaccines = vaccineRepository.findAll();
            if (vaccines.isEmpty()) {
                System.out.println("No vaccines found.");
                return Collections.emptyList();
            }
            return modelMapper.map(vaccines, new TypeToken<List<VaccineResponseDto4>>(){}.getType());
        } catch (RuntimeException e) {
            System.out.println("An error occurred while fetching the vaccine list: " + e.getMessage());
            throw new ServiceException("Unable to fetch vaccines.", e);
        }
    }


    @Override
    public Page<VaccineResponseDto5> vaccineListForReportByFilter(LocalDate beginDate, LocalDate endDate, String vaccineTypeName, String origin, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Vaccine> vaccines = vaccineRepository.findByFilterForReport(beginDate, endDate, vaccineTypeName, origin, pageable);
        List<VaccineResponseDto5> vaccineResponses = modelMapper.map(vaccines.getContent(), new TypeToken<List<VaccineResponseDto5>>(){}.getType());
        return  new PageImpl<>(vaccineResponses, pageable, vaccines.getTotalElements());
    }
}
