package mockProject.team3.Vaccination_20.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import mockProject.team3.Vaccination_20.dto.employeeDto.EmployeeRequestDto1;
import mockProject.team3.Vaccination_20.dto.employeeDto.EmployeeResponseDto1;
import mockProject.team3.Vaccination_20.dto.employeeDto.EmployeeResponseDto2;
import mockProject.team3.Vaccination_20.model.Employee;
import mockProject.team3.Vaccination_20.service.EmployeeService;
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
@RequestMapping("/api/employee")
public class EmployeeController {
    @Autowired
    EmployeeService employeeService;

    @Operation(summary = "Using ajax to load content dynamically")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "ajax html code loaded successfully!"),
            @ApiResponse(responseCode = "400", description = "ajax file name must not be empty!"),
            @ApiResponse(responseCode = "404", description = "ajax path could not find file!")
    })
    @GetMapping("/getAjax")
    public ResponseEntity<String> getDocument(@RequestParam String filename) throws IOException {
        try {
            // if user input filename that is empty or null -> return response 400 and appropriate message
            if (filename == null || filename.isEmpty()) {
                return ResponseEntity.badRequest().body(MSG.MSG31.getMessage());
            }
            ClassPathResource resource = new ClassPathResource("static/html/employee/" + filename);
            Path path = resource.getFile().toPath();
            // if file found, return response 200 and the file
            return ResponseEntity.ok(Files.readString(path));
        } catch(Exception e) {
            // if the path to the file cannot find the file -> return 404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(MSG.MSG32.getMessage());
        }
    }

	@Operation(summary = "fetch an employee from database by employee ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "found an employee by employee ID provided"),
            @ApiResponse(responseCode = "404", description = "employee not found by employee ID provided")
    })
    @GetMapping("/findById")
    public ResponseEntity<EmployeeResponseDto1> findById(@RequestParam String employeeId) {
        EmployeeResponseDto1 employee = employeeService.findById(employeeId);
        if (employee == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(employee);
    }

    @Operation(summary = "find all employees or search employees and put in a pagination list for display")
    @ApiResponse(responseCode = "200", description = "Pagination list of employees found!")
    @GetMapping("/findAll")
    public ResponseEntity<Page<EmployeeResponseDto2>> findAll(@RequestParam String searchInput,
                                                              @RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(employeeService.findBySearch(searchInput, page, size));
    }

    @Operation(summary = "Add a new employee or update an existing one")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "400", content = @Content(schema = @Schema(type = "string", example = "image base64 is not in correct format, failed!"))),
        @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(type = "string", example = "New employee added successfully! or employee updated successfully!")))
    })
    @PostMapping("/add")
    public ResponseEntity<String> addEmployee(@Valid @RequestBody EmployeeRequestDto1 employeeRequestDto1) {
        int serviceResponse = employeeService.addEmployee(employeeRequestDto1);
        if(serviceResponse == 0) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("image base64 is not in correct format, failed!");
        }
        else if(serviceResponse == 1) {
            return ResponseEntity.ok().body("New employee added successfully!");
        }
        else if(serviceResponse == -1) {
            return ResponseEntity.badRequest().body("username already exists, please try again!");
        }
        else {
            return ResponseEntity.ok().body("employee updated successfully!");
        }
    }

    @Operation(summary = "return a picture (in byte[] format)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "picture return successfully!"),
            @ApiResponse(responseCode = "400", description = "picture not found")
    })
            @GetMapping("/image/{id}")
    public ResponseEntity<byte[]> getEmployeeImage(@PathVariable String id) {
        Employee employee = employeeService.findEmployeeById(id);
        byte[] imageBytes = employee.getImage();
        if(imageBytes == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)  // Or IMAGE_PNG based on your image type
                .body(imageBytes);
    }

    @Operation(summary = "delete one or more employees by employee IDs")
    @ApiResponse(responseCode = "200", description = "delete success!")
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteEmployees(@RequestBody List<String> employeeIds) {
        if (employeeIds == null || employeeIds.isEmpty()) {
            return ResponseEntity.badRequest().body("No data deleted!");
        }
        try {
            employeeService.deleteEmployees(employeeIds);
            return ResponseEntity.ok("Employees deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred");
        }
    }
}