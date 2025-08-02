package com.medilens.app.service;

import com.medilens.app.DTO.DoctorDTO;
import com.medilens.app.exception.NotFoundException;
import com.medilens.app.model.Doctor;
import com.medilens.app.model.Status;
import com.medilens.app.model.User;

import javax.print.Doc;
import java.util.List;

public interface DoctorService {
    void save(String email, Doctor doctor) throws NotFoundException;

    List<DoctorDTO> getAll();

    DoctorDTO getDoctorByEmail(String email) throws NotFoundException;

    void delete(String email) throws NotFoundException;

    void edit(String email, DoctorDTO doctorDTO) throws NotFoundException;

    void updaeStatus(String email, Status status) throws NotFoundException;
}
