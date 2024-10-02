package mockProject.team3.Vaccination_20.service.impl;

import jakarta.transaction.Transactional;
import mockProject.team3.Vaccination_20.dto.customerDto.CustomerRequestDto1;
import mockProject.team3.Vaccination_20.dto.customerDto.CustomerResponseDto1;
import mockProject.team3.Vaccination_20.dto.customerDto.CustomerResponseDto2;
import jakarta.annotation.PostConstruct;
import mockProject.team3.Vaccination_20.dto.customerDto.*;
import mockProject.team3.Vaccination_20.model.InjectionResult;
import mockProject.team3.Vaccination_20.repository.CustomerRepository;
import mockProject.team3.Vaccination_20.model.Customer;
import mockProject.team3.Vaccination_20.repository.CustomerRepository;
import mockProject.team3.Vaccination_20.repository.InjectionScheduleRepository;
import mockProject.team3.Vaccination_20.service.CustomerService;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {
    @Autowired
    CustomerRepository customerRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private InjectionScheduleRepository injectionScheduleRepository;

    @Override
    public Page<CustomerResponseDto2> findByFullNameOrAddress(String searchInput, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Customer> customers;
        if (searchInput.trim().isEmpty()) {
            customers = customerRepository.findAll(pageable);
        } else {
            customers = customerRepository.findBySearch(searchInput, pageable);
        }
        List<CustomerResponseDto2> responseCustomers = modelMapper.map(customers.getContent(), new TypeToken<List<CustomerResponseDto2>>() {
        }.getType());
        return new PageImpl<>(responseCustomers, pageable, customers.getTotalElements());
    }

    @Transactional
    @Override
    public int deleteCustomers(CustomerRequestDto2 customerIds) {
        for (String id : customerIds.getCustomerIds()) {
            if (customerRepository.findById(id).isEmpty()) {
                return -1;
            }
        }
        customerRepository.deleteAllById(customerIds.getCustomerIds());
        return 1;
    }


    @Override
    public boolean addCustomer(CustomerRequestDto1 customerRequestDto1) {
        if(customerRepository.findById(customerRequestDto1.getCustomerId()).orElse(null) != null) {
            if(customerRequestDto1.getPassword().equals("null-password-null")) {
                customerRequestDto1.setPassword(null);
            }
        }
        try {
            Customer customer = modelMapper.map(customerRequestDto1, Customer.class);
            if (customer.getPassword() == null) {
                customer.setPassword(customerRepository.findById(customerRequestDto1.getCustomerId()).get().getPassword());
            }
            customer.setPassword(passwordEncoder.encode(customer.getPassword()));
            customerRepository.save(customer);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public CustomerResponseDto1 findById(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error at findByIdService"));
        return modelMapper.map(customer, CustomerResponseDto1.class);
    }

    @Override
    public Page<CustomerListForReportDto> searchCustomers(String fullName, String address, LocalDate fromDate, LocalDate toDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // Perform the search in the repository using the provided parameters
        Page<Customer> customers = customerRepository.searchAllCustomerForReport(fullName, address, fromDate, toDate, pageable);

        // Map the Customer entities to CustomerListForReportDto
        List<CustomerListForReportDto> customerDtos = modelMapper.map(customers.getContent(), new TypeToken<List<CustomerListForReportDto>>() {}.getType());

        // Calculate total number of injections for each customer
        for (Customer customer : customers.getContent()) {
            long totalNumberOfInjection = customer.getInjectionResults().stream()
                    .mapToLong(InjectionResult::getNumberOfInjection)
                    .sum();

            customerDtos.stream()
                    .filter(customerDto -> customerDto.getCustomerId().equals(customer.getCustomerId()))
                    .forEach(customerDto -> customerDto.setTotalNumberOfInjection(totalNumberOfInjection));
        }

        return new PageImpl<>(customerDtos, pageable, customers.getTotalElements());
    }

}
