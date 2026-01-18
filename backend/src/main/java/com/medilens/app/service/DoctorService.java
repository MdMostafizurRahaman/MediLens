package com.PrescribeCorrect.app.service;

import com.PrescribeCorrect.app.dto.DoctorDTO;
import com.PrescribeCorrect.app.exception.NotFoundException;
import com.PrescribeCorrect.app.model.Doctor;
import com.PrescribeCorrect.app.model.Status;
import com.PrescribeCorrect.app.model.User;

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
