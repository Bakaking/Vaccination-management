package mockProject.team3.Vaccination_20.service.impl;

import jakarta.annotation.PostConstruct;
import mockProject.team3.Vaccination_20.dto.injectionScheduleDto.InjectionScheduleResponseDto1;
import mockProject.team3.Vaccination_20.dto.injectionScheduleDto.InjectionScheduleRequestDto1;
import mockProject.team3.Vaccination_20.dto.vaccineDto.VaccineResponseDto4;
import mockProject.team3.Vaccination_20.model.InjectionSchedule;
import mockProject.team3.Vaccination_20.model.Vaccine;
import mockProject.team3.Vaccination_20.repository.InjectionScheduleRepository;
import mockProject.team3.Vaccination_20.repository.VaccineRepository;
import mockProject.team3.Vaccination_20.service.InjectionScheduleService;
import mockProject.team3.Vaccination_20.utils.InjectionScheduleStatus;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
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
public class InjectionScheduleServiceImpl implements InjectionScheduleService {
    @Autowired
    private InjectionScheduleRepository injectionScheduleRepository;

    @Autowired
    private VaccineRepository vaccineRepository;

    @Autowired
    private ModelMapper modelMapper;

//    @PostConstruct
//    public void setupModelMapper() {
//        modelMapper.addMappings(new PropertyMap<Vaccine, VaccineResponseDto4>() {
//            @Override
//            protected void configure() {
//                map().setVaccineName(source.getVaccineName());
//            }
//        });
//    }

    @Override
    public Page<InjectionScheduleResponseDto1> findBySearch(String searchInput, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InjectionSchedule> injectionSchedules;
        if (searchInput.trim().isEmpty()) {
            injectionSchedules = injectionScheduleRepository.findAll(pageable);
        }
        else {
            injectionSchedules = injectionScheduleRepository.findBySearch(searchInput, pageable);
        }
        List<InjectionScheduleResponseDto1> injectionScheduleResponseDto1s = modelMapper.map(injectionSchedules.getContent(), new TypeToken<List<InjectionScheduleResponseDto1>>(){}.getType());
    	return new PageImpl<>(injectionScheduleResponseDto1s, pageable, injectionSchedules.getTotalElements());
    }

    @Override
    public int save(InjectionScheduleRequestDto1 injectionScheduleRequestDto1) {
        InjectionSchedule injectionSchedule = modelMapper.map(injectionScheduleRequestDto1, InjectionSchedule.class);
		if (injectionSchedule.getInjectionScheduleId().equals("")) {
            injectionSchedule.setInjectionScheduleId(null);
        }
        LocalDate today = LocalDate.now();
        if(today.isBefore(injectionSchedule.getStartDate())){
            injectionSchedule.setStatus(InjectionScheduleStatus.NOT_YET);
        } else if (today.isAfter(injectionSchedule.getEndDate())) {
            injectionSchedule.setStatus(InjectionScheduleStatus.OVER);
        } else {
            injectionSchedule.setStatus(InjectionScheduleStatus.OPEN);
        }

        Vaccine vaccine = vaccineRepository.findByVaccineId(injectionScheduleRequestDto1.getVaccineId());
        if(vaccine == null){
            return -1;
        }
        injectionSchedule.setVaccineFromInjectionSchedule(vaccine);
        System.out.println(injectionSchedule.getInjectionScheduleId());
        if (injectionScheduleRepository.save(injectionSchedule).getInjectionScheduleId() != null){
            if (injectionScheduleRepository.findByInjectionScheduleId(injectionScheduleRequestDto1.getInjectionScheduleId()) != null) {
                return 2;
            }
            return 1;
        }
        return 0;
    }

    @Override
    public InjectionScheduleResponseDto1 findByInjectionScheduleId(String id) {
        InjectionSchedule injectionSchedule = injectionScheduleRepository.findByInjectionScheduleId(id);
        if(injectionSchedule == null){
            return null;
        }
        return modelMapper.map(injectionSchedule, InjectionScheduleResponseDto1.class);
    }

}
