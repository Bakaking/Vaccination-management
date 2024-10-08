package mockProject.team3.Vaccination_20.dto.employeeDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mockProject.team3.Vaccination_20.utils.Gender;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class EmployeeResponseDto1 {
    private String employeeId;

    private String address;

    private LocalDate dateOfBirth;

    private String email;

    private String employeeName;

    private Gender gender;

    private byte[] image;

    private String phone;

    private String position;

    private String workingPlace;

    private String username;

    private String password;
}
