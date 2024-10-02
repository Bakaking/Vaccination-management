package mockProject.team3.Vaccination_20.service.impl;
import mockProject.team3.Vaccination_20.dto.newsDto.NewsDeleteDto;
import mockProject.team3.Vaccination_20.dto.newsDto.NewsRequestDto1;
import mockProject.team3.Vaccination_20.dto.newsDto.NewsResponseDto;
import mockProject.team3.Vaccination_20.dto.newsDto.NewsResponseDto1;
import mockProject.team3.Vaccination_20.model.News;
import mockProject.team3.Vaccination_20.repository.NewsRepository;
import mockProject.team3.Vaccination_20.service.NewsService;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class NewsServiceImpl implements NewsService {
    @Autowired
    NewsRepository newsRepository;

    @Autowired
    ModelMapper modelMapper;

    @Override
    public NewsResponseDto addNews(NewsRequestDto1 newsAddRequestDto) {
        News news = modelMapper.map(newsAddRequestDto, News.class);
        news.setPostDate(LocalDate.now());
        return modelMapper.map(newsRepository.save(news), NewsResponseDto.class);
    }

    @Override
    public Page<NewsResponseDto1> findByTittleOrContent(String searchInput, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<News> news;
        if(searchInput.trim().isEmpty()) {
            news = newsRepository.findAll(pageable);
        }else {
            news = newsRepository.findBySearch(searchInput, pageable);
        }
        List<NewsResponseDto1> newsListResponse = modelMapper.map(news.getContent(), new TypeToken<List<NewsResponseDto1>>(){}.getType());
        return new PageImpl<>(newsListResponse, pageable, news.getTotalElements());
    }

    @Override
    public NewsResponseDto findById(String id){
        News news = newsRepository.findByNewsId(id);
        return modelMapper.map(news, NewsResponseDto.class);
    }

    @Override
    public boolean deleteByIds(NewsDeleteDto ids) {
        List<String> idsToDelete = ids.getIds();
        for(String id : idsToDelete){
            newsRepository.deleteById(id);
        }
        return true;
    }

}
