package com.medilens.app.service;

import com.medilens.app.exception.NotFoundException;
import com.medilens.app.model.Doctor;

import javax.print.Doc;
import java.util.List;

public interface DoctorService {
    Long save(Doctor doctor);

    List<Doctor> getAll();

    Doctor getById(Long id) throws NotFoundException;

    void delete(Long id);
}
