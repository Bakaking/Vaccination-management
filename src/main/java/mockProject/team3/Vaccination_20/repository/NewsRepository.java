package mockProject.team3.Vaccination_20.repository;

import mockProject.team3.Vaccination_20.model.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsRepository extends JpaRepository<News, String> {
}
