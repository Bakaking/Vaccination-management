package mockProject.team3.Vaccination_20.controller;

import mockProject.team3.Vaccination_20.model.Customer;
import jakarta.validation.Valid;
import mockProject.team3.Vaccination_20.dto.customerDto.CustomerAddRequestDto;
import mockProject.team3.Vaccination_20.dto.customerDto.CustomerFindByIdDto;
import mockProject.team3.Vaccination_20.dto.customerDto.CustomerFindByIdRequestDto;
import mockProject.team3.Vaccination_20.dto.customerDto.CustomerListResponseDto;
import mockProject.team3.Vaccination_20.service.CustomerService;
import mockProject.team3.Vaccination_20.utils.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.Principal;
import java.util.List;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/customer")
@CrossOrigin(origins = "*")
public class CustomerController {
    @Autowired
    private CustomerService customerService;

    @GetMapping("/getAjax")
    public String getDocument(@RequestParam String filename) throws IOException {
        ClassPathResource resource = new ClassPathResource("static/html/customer/" + filename);
        Path path = resource.getFile().toPath();
        return Files.readString(path);
    }

    @GetMapping("/findAllCustomers")
    public ResponseEntity<ApiResponse<Page<CustomerListResponseDto>>> findAllCustomers(
            @RequestParam String searchInput,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        //method body
        Page<CustomerListResponseDto> customers = customerService.findByFullNameOrAddress(searchInput, page, size);
        if (customers.isEmpty()) {
            ApiResponse<Page<CustomerListResponseDto>> apiResponse = new ApiResponse<>(
                    0,
                    "No data found!",
                    customers);
            return ResponseEntity.ok(apiResponse);
        } else {
            System.out.println("checkpoint 2");
            ApiResponse<Page<CustomerListResponseDto>> apiResponse = new ApiResponse<>(
                    1,
                    "Data found!",
                    customers);
            return ResponseEntity.ok(apiResponse);
        }
    }

    @GetMapping("/getCurrentUsername")
    public ResponseEntity<String> getCurrentUsername(Principal principal) {
        return ResponseEntity.ok(principal.getName());
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<String>> deleteCustomers(@RequestBody List<String> customerIds) {
        if (customerIds == null || customerIds.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "No data deleted!", null));
        }

        try {
            customerService.deleteCustomers(customerIds);
            return ResponseEntity.ok(new ApiResponse<>(200, "Customers deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(500, "An error occurred: " + e.getMessage(), null));
        }
    }

    //use for add injection-rs
    @GetMapping("c-for-add-ir")
    public ResponseEntity<List<Map<String, String>>> getAllCustomers() {
        List<Customer> customers = customerService.getAllCustomers();

        List<Map<String, String>> customerInfo = customers.stream().map(customer -> {
            Map<String, String> info = new HashMap<>();
            info.put("id", customer.getCustomerId());
            info.put("name", customer.getFullName());
            info.put("dateOfBirth", customer.getDateOfBirth().toString());
            return info;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(customerInfo);
    }
}

    @PostMapping("/add")
    public ResponseEntity<String> addCustomer(@Valid @RequestBody CustomerAddRequestDto customerAddRequestDto) {
        System.out.println("entering /customer/add endpoint!");
        if (customerService.addCustomer(customerAddRequestDto)) {
            System.out.println("enterting if->true!");
            return ResponseEntity.ok("Add customer success!");
        }
        System.out.println("entering if->false!");
        return ResponseEntity.ok("Fail to add customer!");
    }

    @GetMapping("/findById")
    public ResponseEntity<CustomerFindByIdDto> findById(@RequestParam String id) {
        return ResponseEntity.ok().body(customerService.findById(id));
    }
}

