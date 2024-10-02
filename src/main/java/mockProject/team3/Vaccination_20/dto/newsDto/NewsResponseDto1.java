package mockProject.team3.Vaccination_20.dto.newsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class NewsResponseDto1 {
    private String newsId;
    private String content;
    private String preview;
    private String title;
    private LocalDate postDate;
}
