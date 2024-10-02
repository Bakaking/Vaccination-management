package mockProject.team3.Vaccination_20.repository;

import jakarta.transaction.Transactional;
import mockProject.team3.Vaccination_20.dto.customerDto.CustomerListForReportDto;
import mockProject.team3.Vaccination_20.model.Customer;
import mockProject.team3.Vaccination_20.model.InjectionSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    @Query("SELECT c FROM Customer c WHERE " +
            "LOWER(c.fullName) LIKE LOWER(CONCAT('%', :searchInput, '%')) OR " +
            "LOWER(c.address) LIKE LOWER(CONCAT('%', :searchInput, '%'))")
    Page<Customer> findBySearch(String searchInput, Pageable pageable);

    //use for add-ir
    List<Customer> findAll();

    @Query("SELECT c FROM Customer c " +
            "LEFT JOIN c.injectionResults ir " +
            "WHERE (:fullName IS NULL OR :fullName = '' OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :fullName, '%'))) " +
            "AND (:address IS NULL OR :address = '' OR LOWER(c.address) LIKE LOWER(CONCAT('%', :address, '%'))) " +
            "AND (:fromDate IS NULL OR c.dateOfBirth >= :fromDate) " +
            "AND (:toDate IS NULL OR c.dateOfBirth <= :toDate)")
    Page<Customer> searchAllCustomerForReport(
            @Param("fullName") String fullName,
            @Param("address") String address,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable);

}
