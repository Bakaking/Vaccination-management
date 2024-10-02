package mockProject.team3.Vaccination_20.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import mockProject.team3.Vaccination_20.dto.injectionScheduleDto.InjectionScheduleResponseDto1;
import mockProject.team3.Vaccination_20.dto.injectionScheduleDto.InjectionScheduleRequestDto1;
import mockProject.team3.Vaccination_20.service.InjectionScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/injection-schedule")
public class InjectionScheduleController {

    @Autowired
    private InjectionScheduleService injectionScheduleService;

    @Operation(summary = "Find all injection schedules or search with pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pagination list of injection schedules found!"),
            @ApiResponse(responseCode = "404", description = "No injection schedules found!")
    })
    @GetMapping("/findAll")
    public ResponseEntity<Page<InjectionScheduleResponseDto1>> findAll(@RequestParam String searchInput,
                                                                       @RequestParam(defaultValue = "0") int page,
                                                                       @RequestParam(defaultValue = "5") int size) {
        Page<InjectionScheduleResponseDto1> result = injectionScheduleService.findBySearch(searchInput, page, size);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Load an HTML document dynamically using Ajax")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "HTML document loaded successfully!"),
            @ApiResponse(responseCode = "400", description = "Filename must not be empty!"),
            @ApiResponse(responseCode = "404", description = "HTML file not found!")
    })
    @GetMapping("/getAjax")
    public ResponseEntity<String> getDocument(@RequestParam String filename) throws IOException {
        if (filename == null || filename.isEmpty()) {
            return ResponseEntity.badRequest().body("Filename must not be empty!");
        }
        try {
            ClassPathResource resource = new ClassPathResource("static/html/injection-schedule/" + filename);
            Path path = resource.getFile().toPath();
            String content = Files.readString(path);
            return ResponseEntity.ok(content);
        } catch (IOException e) {
            return ResponseEntity.status(404).body("HTML file not found!");
        }
    }

    @Operation(summary = "Add a new injection schedule")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Injection schedule added successfully!"),
            @ApiResponse(responseCode = "400", description = "Failed to add injection schedule!")
    })
    @PostMapping("/add")
    public ResponseEntity<String> add(@Valid @RequestBody InjectionScheduleRequestDto1 injectionScheduleRequestDto1) {
        int save = injectionScheduleService.save(injectionScheduleRequestDto1);
        if (save == 1) {
            return ResponseEntity.ok("Add injection schedule successful");
        }
        if (save == -1) {
            return ResponseEntity.badRequest().body("Add fail, no vaccine found for schedule");
        }
        if (save == 2) {
            return ResponseEntity.ok("update injection schedule success!");
        }
        return ResponseEntity.badRequest().body("Add injection schedule failed");
    }

    @Operation(summary = "Find an injection schedule by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Injection schedule found by ID"),
            @ApiResponse(responseCode = "404", description = "Injection schedule not found by ID")
    })
    @GetMapping("/findById")
    public ResponseEntity<InjectionScheduleResponseDto1> findById(@RequestParam String id) {
        InjectionScheduleResponseDto1 injectionSchedule = injectionScheduleService.findByInjectionScheduleId(id);
        if (injectionSchedule == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(injectionSchedule);
    }
}
