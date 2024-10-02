package mockProject.team3.Vaccination_20.dto.vaccineDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mockProject.team3.Vaccination_20.utils.Status;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class VaccineResponseDto1 {
	private String vaccineId;
    private String vaccineName;
    private Status vaccineStatus;
}
