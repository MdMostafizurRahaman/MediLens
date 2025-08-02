package com.medilens.app.service.imp;

import com.medilens.app.exception.NotFoundException;
import com.medilens.app.model.Doctor;
import com.medilens.app.repository.DoctorRepository;
import com.medilens.app.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorServiceImp implements DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Override
    public Long save(Doctor doctor) {
        return doctorRepository.save(doctor).getId();
    }

    @Override
    public List<Doctor> getAll() {
        return doctorRepository.findAll();
    }

    @Override
    public Doctor getById(Long id) throws NotFoundException {
        return doctorRepository.findById(id)
                .orElseThrow(
                        ()-> new NotFoundException("Doctor not found with id: " + id)
                );
    }

    @Override
    public void delete(Long id) {
        doctorRepository.deleteById(id);
    }
}
