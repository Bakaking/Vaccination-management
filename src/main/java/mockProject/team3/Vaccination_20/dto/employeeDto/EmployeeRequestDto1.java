package mockProject.team3.Vaccination_20.dto.employeeDto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mockProject.team3.Vaccination_20.utils.Gender;

import java.time.LocalDate;
import java.time.Period;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class EmployeeRequestDto1 {
    @Size(max = 36, message = "Employee ID must not exceed 36 characters!")
    private String employeeId;

    @NotBlank(message = "Employee's address must not be blank!")
    private String address;

    @NotNull(message = "Employee date of birth must not be null!")
    private LocalDate dateOfBirth;

    @AssertTrue(message = "Employee must be at least 18 years old.")
    public boolean isAgeValid() {
        LocalDate today = LocalDate.now();
        Period age = Period.between(dateOfBirth, today);
        return age.getYears() > 18 || (age.getYears() == 18 && (age.getMonths() > 0 || age.getDays() >= 0));
    }

    @AssertTrue(message = "Date of birth must be in the past.")
    public boolean isDateOfBirthInThePast() {
        return dateOfBirth.isBefore(LocalDate.now());
    }

    @NotBlank(message = "Email must not be blank!")
    @Email(message = "Invalid email format!")
    private String email;

    @Size(max = 100, message = "Employee name must not exceed 100 characters.")
    @NotBlank(message = "Employee name must not be blank!")
    private String employeeName;

    @NotNull(message = "Employee gender must not be null!")
    private Gender gender;

    @NotBlank(message = "Image must not be blank!")
    private String image;

    @Size(max = 20, message = "Employee's phone must not exceed 20 characters.")
    @NotBlank(message = "Employee's phone must not be blank!")
    @Pattern(regexp = "^\\+?[0-9]{7,20}$", message = "Invalid phone number format.")
    private String phone;

    @NotBlank(message = "Position must not be blank!")
    private String position;

    @NotBlank(message = "Working place must not be blank!")
    private String workingPlace;

    @NotBlank(message = "Username must not be blank!")
    private String username;

    @NotBlank(message = "Password must not be blank!")
    private String password;

    private Boolean isFromUpdate;
}
