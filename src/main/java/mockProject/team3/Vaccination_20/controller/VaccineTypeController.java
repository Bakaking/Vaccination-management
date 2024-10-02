package mockProject.team3.Vaccination_20.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import mockProject.team3.Vaccination_20.dto.vaccineTypeDto.*;
import mockProject.team3.Vaccination_20.model.VaccineType;
import mockProject.team3.Vaccination_20.service.VaccineTypeService;
import mockProject.team3.Vaccination_20.utils.MSG;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;


@RestController
@RequestMapping("/api/vaccine-type")
public class VaccineTypeController {

    @Autowired
    private VaccineTypeService vaccineTypeService;

    @Operation(summary = "find all vaccine type and put in a pagination list for display")
    @ApiResponse(responseCode = "200", description = "Pagination list of vaccine type found!")
    @GetMapping("/findAll")
    public ResponseEntity<Page<VaccineTypeResponseDto1>> findAllWithPagination(@RequestParam String searchInput,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "5") int size) {
        Page<VaccineTypeResponseDto1> vaccineTypes = vaccineTypeService.findBySearchWithPagination(searchInput, page, size);
        return ResponseEntity.ok(vaccineTypes);
    }

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
            ClassPathResource resource = new ClassPathResource("static/html/vaccine-type/" + filename);
            Path path = resource.getFile().toPath();
            return ResponseEntity.ok(Files.readString(path));
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(MSG.MSG32.getMessage());

        }
    }

    @Operation(summary = "get list of vaccine type for drop-down list")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of active vaccine type found"),
            @ApiResponse(responseCode = "400", description = "No vaccine type that is active")
    })
    @GetMapping("/vt-for-add-ir")
    public ResponseEntity<List<VaccineTypeResponseDto5>> getAllVaccineTypes() {
        List<VaccineTypeResponseDto5> vaccineTypeResponseDto5s = vaccineTypeService.getAllVaccineTypes();
        if(vaccineTypeResponseDto5s.isEmpty()) {
            return ResponseEntity.badRequest().body(vaccineTypeResponseDto5s);
        }
        return ResponseEntity.ok(vaccineTypeResponseDto5s);
    }

    @Operation(summary = "Add a new vaccine type or update an existing one")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(type = "string", example = "New vaccine type added(updated) successfully"))),
            @ApiResponse(responseCode = "400", content = @Content(schema = @Schema(type = "string", example = "Add(update) failed!")))
    })
    @PostMapping("/add")
    public ResponseEntity<String> addVaccineType(@Valid @RequestBody VaccineTypeRequestDto1 vaccineTypeRequestDto1) {
        int result = vaccineTypeService.addVaccineType(vaccineTypeRequestDto1);
    	if (result == 0) {
            return ResponseEntity.badRequest().body("cannot add new vaccineType, due to image fault");
        }
        return ResponseEntity.ok("add new vaccine type success!");
    }

    @Operation(summary = "fetch a vaccine type from database by vaccine type Id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "found a vaccine type by customer ID provided"),
            @ApiResponse(responseCode = "404", description = "vaccine type not found by customer ID provided")
    })
    @GetMapping("/detail/{vaccineTypeId}")
    public ResponseEntity<VaccineTypeResponseDto2> getVaccineTypeDetail(@PathVariable String vaccineTypeId) {
        VaccineTypeResponseDto2 vaccineType = vaccineTypeService.findById(vaccineTypeId);
        if (vaccineType == null){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(vaccineType);
    }

    @Operation(summary = "change status of selected vaccine types from active to inactive")
    @ApiResponse(responseCode = "200", description = "Change status successfully!")
    @PutMapping("/make-inactive")
    public ResponseEntity<String> makeInactive(@Valid @RequestBody VaccineTypeRequestDto2 vaccineTypeRequestDto2) {
        int count = vaccineTypeService.makeInactive(vaccineTypeRequestDto2.getVaccineTypeListIds());
        if (count > 0) {
            return ResponseEntity.ok("Made " + count + " vaccine types inactive successfully.");
        } else if(count == -1) {
            return ResponseEntity.badRequest().body("Please select only active vaccine types");
        }
        return ResponseEntity.badRequest().body("No active vaccine types found.");
    }

    @Operation(summary = "display vaccine type image")
    @ApiResponse(responseCode = "200", description = "Image display successfully")
    @GetMapping("/image/{id}")
    public ResponseEntity<byte[]> getVaccineTypeImage(@PathVariable String id) {
        VaccineType vaccineType = vaccineTypeService.findVaccineTypeById(id);
        if (vaccineType == null || vaccineType.getVaccineTypeImage() == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] imageBytes = vaccineType.getVaccineTypeImage();
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)  // Or IMAGE_PNG based on your image type
                .body(imageBytes);
    }
}
