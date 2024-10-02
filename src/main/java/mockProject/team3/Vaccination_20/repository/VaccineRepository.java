package mockProject.team3.Vaccination_20.repository;

import mockProject.team3.Vaccination_20.dto.vaccineDto.VaccineResponseDto5;
import mockProject.team3.Vaccination_20.model.Vaccine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VaccineRepository extends JpaRepository<Vaccine, String> {

    boolean existsByVaccineName(String vaccineName);

    Vaccine findByVaccineId(String vaccineId);

    //use for add-ir
    List<Vaccine> findAll();

    List<Vaccine> findByVaccineType_VaccineTypeId(String vaccineTypeId);

    @Query("SELECT v FROM Vaccine v WHERE "+
            "LOWER(v.vaccineId) LIKE LOWER(CONCAT('%', :searchInput, '%')) OR " +
            "LOWER(v.vaccineName) LIKE LOWER(CONCAT('%', :searchInput, '%')) OR " +
            "LOWER(v.vaccineType.vaccineTypeName) LIKE LOWER(CONCAT('%', :searchInput, '%'))")
    Page<Vaccine> findBySearchInput(String searchInput, Pageable pageable);

    @Query("SELECT v FROM Vaccine v WHERE " +
            "(:beginDate IS NULL OR :endDate IS NULL OR " +
            "(v.timeBeginNextInjection BETWEEN :beginDate AND :endDate) " +
            "OR (v.timeEndNextInjection BETWEEN :beginDate AND :endDate)) " +
            "AND (:vaccineTypeName IS NULL OR LOWER(v.vaccineType.vaccineTypeName) LIKE LOWER(CONCAT('%', :vaccineTypeName, '%'))) " +
            "AND (:origin IS NULL OR LOWER(v.vaccineOrigin) LIKE LOWER(CONCAT('%', :origin, '%')))")
    Page<Vaccine> findByFilterForReport(@Param("beginDate") LocalDate beginDate,
                                        @Param("endDate") LocalDate endDate,
                                        @Param("vaccineTypeName") String vaccineTypeName,
                                        @Param("origin") String origin,
                                        Pageable pageable);
}
