package mockProject.team3.Vaccination_20.repository;

import mockProject.team3.Vaccination_20.model.NewsType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsTypeRepository extends JpaRepository<NewsType, String> {
}
