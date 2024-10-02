package mockProject.team3.Vaccination_20.dto.injectionScheduleDto;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class InjectionScheduleRequestDto1 {

    @Size(max = 36, message = "Injection schedule ID must not exceed 36 characters!")
    private String injectionScheduleId;

    @Size(max = 1000, message = "Injection schedule description must not exceed 1000 characters!")
    private String injectionScheduleDescription;

    @NotNull(message = "End date must not be null!")
    private LocalDate endDate;

    @NotBlank(message = "Place must not be null!")
    private String place;

    @NotNull(message = "Start date must not be null!")
    private LocalDate startDate;

    @NotBlank(message = "Vaccine ID must not be null!")
    private String vaccineId;

    @AssertTrue(message = "Start date must be before the end date.")
    public boolean isStartDateBeforeEndDate() {
        if (startDate != null && endDate != null) {
            return startDate.isBefore(endDate);
        }
        return true;
    }
}
