package mockProject.team3.Vaccination_20.service.impl;
import jakarta.persistence.EntityNotFoundException;

import java.util.ArrayList;
import java.util.Arrays;
import mockProject.team3.Vaccination_20.dto.vaccineTypeDto.VaccineTypeRequestDto1;

import mockProject.team3.Vaccination_20.dto.vaccineTypeDto.VaccineTypeResponseDto1;
import mockProject.team3.Vaccination_20.dto.vaccineTypeDto.VaccineTypeResponseDto2;
import mockProject.team3.Vaccination_20.dto.vaccineTypeDto.VaccineTypeResponseDto5;
import mockProject.team3.Vaccination_20.model.VaccineType;
import mockProject.team3.Vaccination_20.repository.VaccineTypeRepository;
import mockProject.team3.Vaccination_20.service.VaccineTypeService;
import mockProject.team3.Vaccination_20.utils.Status;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VaccineTypeServiceImpl implements VaccineTypeService {

    @Autowired
    private VaccineTypeRepository vaccineTypeRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<VaccineTypeResponseDto5> getAllVaccineTypes() {
        List<VaccineType> vaccineTypes = vaccineTypeRepository.findAll()
                .stream()
                .filter(vaccineType -> vaccineType.getVaccineTypeStatus() == Status.ACTIVE)
                .collect(Collectors.toList());
        if(vaccineTypes.isEmpty()) {
            return new ArrayList<>();
        }
        return modelMapper.map(vaccineTypes, new TypeToken<List<VaccineTypeResponseDto5>>(){}.getType());
    }

    @Override
    public VaccineType addVaccineType(VaccineType vaccineType) {
        if (vaccineType == null) {
            throw new IllegalArgumentException("VaccineType cannot be null.");
        }

        // If image is not provided, handle as necessary (e.g., setting a default image or leaving it null)
        if (vaccineType.getVaccineTypeImage() != null && vaccineType.getVaccineTypeImage().length > 0) {
            try {
                // Assuming the image is still in Base64 format and needs decoding
                String base64Image = new String(vaccineType.getVaccineTypeImage());
                byte[] decodedImage = Base64.getDecoder().decode(base64Image.replaceAll("\\s", "")); // Clean and decode
                vaccineType.setVaccineTypeImage(decodedImage); // Set the decoded byte array
            } catch (IllegalArgumentException e) {
                System.err.println("Failed to decode image: " + e.getMessage());
                throw new RuntimeException("Invalid Base64 image data", e);
            }
        }
        // Save the vaccine type to the repository
        return vaccineTypeRepository.save(vaccineType);
    }

    @Override
    public VaccineType findVaccineTypeById(String id) {
        return vaccineTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vaccine type not found with id: " + id));
    }

    @Override
    public int addVaccineType(VaccineTypeRequestDto1 vaccineTypeRequestDto1) {
        if(vaccineTypeRequestDto1.getVaccineTypeImage().equals("null-image")) {
            vaccineTypeRequestDto1.setVaccineTypeImage(null);
        }
        VaccineType vaccineType = vaccineTypeRepository.findByVaccineTypeId(vaccineTypeRequestDto1.getVaccineTypeId());
        if(vaccineTypeRequestDto1.getVaccineTypeImage() == null && vaccineType != null) {
            byte[] currentImage = vaccineTypeRepository.findByVaccineTypeId(vaccineTypeRequestDto1.getVaccineTypeId()).getVaccineTypeImage();
            vaccineType = modelMapper.map(vaccineTypeRequestDto1, VaccineType.class);
            vaccineType.setVaccineTypeImage(currentImage);
        } else {
            vaccineType = modelMapper.map(vaccineTypeRequestDto1, VaccineType.class);
        }
        if (vaccineTypeRequestDto1.getVaccineTypeImage() != null && !vaccineTypeRequestDto1.getVaccineTypeImage().isEmpty()) {
            try {
                // Clean and decode the Base64 string
                String base64Image = vaccineTypeRequestDto1.getVaccineTypeImage();
                byte[] decodedImage = Base64.getDecoder().decode(base64Image);
                vaccineType.setVaccineTypeImage(decodedImage);
            } catch (IllegalArgumentException e) {
                return 0;
            }
        }
        VaccineType vaccineTypeResult = vaccineTypeRepository.save(vaccineType);
        return 1;
    }

    @Override
    public VaccineTypeResponseDto2 findById(String id) {
        VaccineType vaccineType = vaccineTypeRepository.findById(id).get();
        return modelMapper.map(vaccineType, VaccineTypeResponseDto2.class);
    }

    @Override
    public int makeInactive(List<String> vaccineTypeIds) {
        int count = 0;
        List<VaccineType> vaccineTypes = vaccineTypeRepository.findAllById(vaccineTypeIds);
        if(vaccineTypes.isEmpty()) {
            return 0;
        }
        for (VaccineType vaccineType : vaccineTypes) {
            if(vaccineType.getVaccineTypeStatus() == Status.INACTIVE) {
                return -1;
            }
            vaccineType.setVaccineTypeStatus(Status.INACTIVE);
            count++;
        }
        vaccineTypeRepository.saveAll(vaccineTypes);
        return count;
    }

    @Override
    public Page<VaccineTypeResponseDto1> findBySearchWithPagination(String searchInput, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
		Page<VaccineType> vaccineTypePage;
        if (StringUtils.hasText(searchInput)) {
            vaccineTypePage = vaccineTypeRepository.findBySearch(searchInput, pageable);
        } else {
            vaccineTypePage = vaccineTypeRepository.findAll(pageable);
        }
        List<VaccineTypeResponseDto1> responseVaccineTypes = modelMapper.map(vaccineTypePage.getContent(), new TypeToken<List<VaccineTypeResponseDto1>>() {}.getType());
        return new PageImpl<>(responseVaccineTypes, pageable, vaccineTypePage.getTotalElements());
    }


}
