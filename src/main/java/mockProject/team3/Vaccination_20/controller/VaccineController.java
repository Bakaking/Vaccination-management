package mockProject.team3.Vaccination_20.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import mockProject.team3.Vaccination_20.dto.vaccineDto.VaccineRequestDto1;
import mockProject.team3.Vaccination_20.dto.vaccineDto.VaccineResponseDto3;
import mockProject.team3.Vaccination_20.dto.vaccineDto.VaccineResponseDto4;
import mockProject.team3.Vaccination_20.dto.vaccineDto.VaccineResponseDto5;
import mockProject.team3.Vaccination_20.exception.vaccine_exception.VaccineAlreadyExistsException;
import mockProject.team3.Vaccination_20.service.VaccineService;
import mockProject.team3.Vaccination_20.utils.MSG;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/vaccine")
public class VaccineController {
    @Autowired
    private VaccineService vaccineService;

    @Operation(summary = "Using ajax to load content dynamically")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "ajax html code loaded successfully"),
            @ApiResponse(responseCode = "400", description = "ajax file name must not be empty!"),
            @ApiResponse(responseCode = "404", description = "ajax path could not find file!")
    })
    @GetMapping("/getAjax")
    public ResponseEntity<String> getDocument(@RequestParam String filename) throws IOException {
        try{
            if (filename == null || filename.isEmpty()) {
                return ResponseEntity.badRequest().body(MSG.MSG31.getMessage());
            }
            ClassPathResource resource = new ClassPathResource("static/html/vaccine/" + filename);
            Path path = resource.getFile().toPath();
            return ResponseEntity.ok(Files.readString(path));
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(MSG.MSG32.getMessage());
        }
    }

    @Operation(summary = "Add a new vaccine or update an existing one")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "New vaccine added/updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid data! Please check input fields."),
        @ApiResponse(responseCode = "404", description = "Vaccine type not found!"),
        @ApiResponse(responseCode = "409", description = "Vaccine already existed!"),
        @ApiResponse(responseCode = "500", description = "Internal server error! Please try again later.")
    })
    @PostMapping("/add")
    public ResponseEntity<String> createVaccine(@Valid @RequestBody VaccineRequestDto1 vaccineRequestDto1) {
        try{
            int result = vaccineService.createVaccine(vaccineRequestDto1);
            if(result == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Vaccine type not found!");
            }
            return ResponseEntity.ok("add new vaccine success!");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error! Please try again later.");
        }
    }

    @Operation(summary = "Search for vaccines based on input with pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Vaccines retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No vaccines found"),
            @ApiResponse(responseCode = "400", description = "Invalid input provided"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/search")
    public ResponseEntity<Page<VaccineResponseDto3>> getVaccineListBySearchInput(
            @RequestParam("searchInput") String searchInput,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        try {
            Page<VaccineResponseDto3> vaccinePage = vaccineService.getVaccineListBySearchInput(searchInput, page, size);
            return ResponseEntity.ok(vaccinePage);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Operation(summary = "fetch a vaccine from database by vaccine Id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "found a vaccine by vaccine ID provided"),
            @ApiResponse(responseCode = "404", description = "vaccine not found by vaccine ID provided"),
            @ApiResponse(responseCode = "500", description = "internal server error occurred")
    })
    @GetMapping("/detail/{vaccineId}")
    public ResponseEntity<VaccineResponseDto5> getVaccineById(@PathVariable String vaccineId) {
        try{
            VaccineResponseDto5 vaccineResponseDto5 = vaccineService.getVaccineById(vaccineId);
            if(vaccineResponseDto5 == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(vaccineResponseDto5);
        } catch (NoSuchElementException e){
            return ResponseEntity.notFound().build();
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Change status of selected vaccines from active to inactive")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Change status successfully!"),
            @ApiResponse(responseCode = "400", description = "Failed to change vaccine status!"),
            @ApiResponse(responseCode = "500", description = "Unexpected server error!")
    })
    @PutMapping("/change-status")
    public ResponseEntity<String> updateVaccineStatus(@RequestBody List<String> vaccineIds) {
        int result = vaccineService.changeStatusVaccine(vaccineIds);

        switch (result) {
            case -2:
                return ResponseEntity.badRequest().body("Could not find a vaccine with the given IDs.");
            case -1:
                return ResponseEntity.badRequest().body("Please select only vaccines with ACTIVE status.");
            case 0:
                return ResponseEntity.badRequest().body("No vaccine was selected.");
            case -3:
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred while changing the vaccine status.");
            default:
                return ResponseEntity.ok("Successfully changed " + result + " vaccines' status to inactive.");
        }
    }


    @Operation(summary = "Export Excel template for vaccine import.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Template exported successfully!"),
            @ApiResponse(responseCode = "500", description = "Failed to export template due to server error.")
    })
    @GetMapping("/export/excel")
    public ResponseEntity<String> exportTemplate(HttpServletResponse response) {
        try {
            vaccineService.exportTemplate(response);
            return ResponseEntity.ok("Template exported successfully!");
        } catch (IOException e) {
            System.out.println("Error occurred while exporting the template: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to export template due to server error.");
        }
    }


    @Operation(summary = "Import vaccine through excel file")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Import success!"),
            @ApiResponse(responseCode = "400", description = "File import is empty or contains errors!"),
            @ApiResponse(responseCode = "500", description = "Failed to upload and import file")
    })
    @PostMapping("/import/excel")
    public ResponseEntity<String> importFromExcel(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please upload a valid Excel file.");
        }
        try {
            List<String> notifications = vaccineService.importVaccineFromExcel(file);
            boolean hasCriticalErrors = notifications.stream()
                    .anyMatch(notification -> notification.contains("Header mismatch") || notification.contains("not found"));
            if (hasCriticalErrors) {
                StringBuilder responseMessage = new StringBuilder("File contains critical errors and cannot be imported:\n");
                for (String notification : notifications) {
                    responseMessage.append(notification).append("\n");
                }
                return ResponseEntity.badRequest().body(responseMessage.toString());
            }
            StringBuilder responseMessage = new StringBuilder("File uploaded and data imported successfully.");
            if (!notifications.isEmpty()) {
                responseMessage.append(" with notification:\n");
                for (String notification : notifications) {
                    responseMessage.append(notification).append("\n");
                }
            }
            return ResponseEntity.ok(responseMessage.toString());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload and import file.");
        }
    }


    @Operation(summary = "Find all vaccines")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of vaccines found"),
            @ApiResponse(responseCode = "204", description = "No vaccines found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/findAllVaccineName")
    public ResponseEntity<List<VaccineResponseDto4>> findAllVaccineName() {
        List<VaccineResponseDto4> vaccineList = vaccineService.findAllVaccineName();

        if (vaccineList.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(vaccineList);
    }

}
