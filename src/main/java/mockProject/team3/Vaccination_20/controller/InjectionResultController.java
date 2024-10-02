package mockProject.team3.Vaccination_20.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import mockProject.team3.Vaccination_20.dto.injectionResultDto.*;
import mockProject.team3.Vaccination_20.service.InjectionResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;


@RestController
@RequestMapping("/api/injection-result")
public class InjectionResultController {

    @Autowired
    private InjectionResultService injectionResultService;

    // Load HTML document dynamically using Ajax
    @Operation(summary = "Using ajax to load content dynamically")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ajax HTML code loaded successfully!"),
            @ApiResponse(responseCode = "400", description = "Ajax file name must not be empty!"),
            @ApiResponse(responseCode = "404", description = "Ajax path could not find file!")
    })
    @GetMapping("/getAjax")
    public ResponseEntity<String> getDocument(@RequestParam String filename) throws IOException {
        try {
            if (filename == null || filename.isEmpty()) {
                return ResponseEntity.badRequest().body("Filename must not be empty!");
            }
            ClassPathResource resource = new ClassPathResource("static/html/injectionresult/" + filename);
            Path path = resource.getFile().toPath();
            return ResponseEntity.ok(Files.readString(path));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Could not find the specified file.");
        }
    }

    @Operation(summary = "Find all injection results or search injection results and put in a pagination list for display")
    @ApiResponse(responseCode = "200", description = "Pagination list of injection results found!")
    @GetMapping("/findBySearch")
    public ResponseEntity<Page<InjectionResultResponseDto3>> findBySearch(@RequestParam String searchInput,
                                                                          @RequestParam(defaultValue = "0") int page,
                                                                          @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(injectionResultService.findBySearch(searchInput, page, size));
    }

    @Operation(summary = "Add a new injection result")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "create/update injection result success!"),
            @ApiResponse(responseCode = "400", description = "Failed to add injection result!")
    })
    @PostMapping("/add")
    public ResponseEntity<String> addInjectionResult(@Valid @RequestBody InjectionResultRequestDto1 injectionResultDto) {
        int result = injectionResultService.addInjectionResult(injectionResultDto);
        if (result == 0) {
            return ResponseEntity.badRequest().body("Failed to add injection result!");
        } else if (result == 2) {
            return ResponseEntity.ok("update injection result success!");
        } else {
            return ResponseEntity.ok("Add injection result success!");
        }
    }

    @Operation(summary = "Get injection result details by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Injection result found by ID"),
            @ApiResponse(responseCode = "404", description = "Injection result not found by ID")
    })
    @GetMapping("/detail/{injectionResultId}")
    public ResponseEntity<InjectionResultResponseDto3> getInjectionResult(@PathVariable String injectionResultId) {
        InjectionResultResponseDto3 injectionResult = injectionResultService.getInjectionResultById(injectionResultId);
        if (injectionResult == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(injectionResult);
    }

    @Operation(summary = "Update an existing injection result")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Injection result updated successfully!"),
            @ApiResponse(responseCode = "404", description = "Injection result not found!")
    })

    @GetMapping("/displayDropdown")
    public ResponseEntity<InjectionResultResponseDto2> displayDropdown() {
        InjectionResultResponseDto2 injectionResultResponseDto2 = injectionResultService.displayDropdown();
        if(injectionResultResponseDto2 == null){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(injectionResultService.displayDropdown());
    }

    @GetMapping("/places")
    public ResponseEntity<List<String>> getAllInjectionPlaces() {
        List<String> places = injectionResultService.getAllInjectionPlaces();
        return new ResponseEntity<>(places, HttpStatus.OK);
    }

    @Operation(summary = "Delete one or more injection results by their IDs")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Injection results deleted successfully!"),
            @ApiResponse(responseCode = "400", description = "No data deleted!"),
            @ApiResponse(responseCode = "500", description = "An error occurred while deleting injection results.")
    })
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteInjectionResults(@RequestBody List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body("No data deleted!");
        }
        try {
            injectionResultService.deleteInjectionResults(ids);
            return ResponseEntity.ok("Injection results deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while deleting injection results.");
        }
    }

}

