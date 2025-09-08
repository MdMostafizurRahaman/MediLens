package com.medilens.app.service.imp;

import com.medilens.app.dto.DoctorDTO;
import com.medilens.app.exception.NotFoundException;
import com.medilens.app.model.Doctor;
import com.medilens.app.model.Role;
import com.medilens.app.model.Status;
import com.medilens.app.model.User;
import com.medilens.app.repository.DoctorRepository;
import com.medilens.app.repository.UserRepository;
import com.medilens.app.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorServiceImp implements DoctorService {

    DoctorDTO convertToDoctorDTO(User user) {
        return new DoctorDTO(user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getDoctor().getSpecialization(),
                user.getDoctor().getDegree(),
                user.getDoctor().getPhoneNumber(),
                user.getDoctor().getChamberAddress(),
                user.getDoctor().getDesignation(),
                user.getDoctor().getInstitute(),
                user.getDoctor().getCurrentCity(),
                user.getDoctor().getAvailableTime(),
                user.getDoctor().getWebsiteUrl(),
                user.getDoctor().getStatus());
    }

    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public void save(String email, Doctor doctor) throws NotFoundException {
        doctor.setStatus(Status.PENDING);
        doctor.setUser(userRepository.getUserByEmail(email).orElseThrow(
                () -> new NotFoundException("Doctor not found with this email")));
        doctorRepository.save(doctor);
    }

    @Override
    public List<DoctorDTO> getAll() {
        List<User> users = userRepository.findByRole(Role.ROLE_DOCTOR);

        return users.stream()
                .filter(user -> user.getDoctor() != null)
                .map(this::convertToDoctorDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorDTO getDoctorByEmail(String email) throws NotFoundException {
        User user = userRepository.getUserByEmail(email)
                .orElseThrow(
                        ()-> new NotFoundException("Doctor not found with id: " + email)
                );
        if (user.getDoctor() == null) {
            throw new IllegalArgumentException("Doctor info not found with id: " + email);
        }
        return convertToDoctorDTO(user);
    }

    @Override
    public void delete(String email) throws NotFoundException {
        User user = userRepository.getUserByEmail(email)
                        .orElseThrow(()-> new NotFoundException("Doctor not found with id: " + email));
        userRepository.delete(user);
    }

    @Override
    public void edit(String email, DoctorDTO doctorDTO) throws NotFoundException {
        User user = userRepository.getUserByEmail(email)
                .orElseThrow(()-> new NotFoundException("Doctor not found with id: " + email));
        user.setFirstName(doctorDTO.getFirstName());
        user.setLastName(doctorDTO.getLastName());
        userRepository.save(user);

        Doctor doctor = new Doctor(
                user.getDoctor().getId(),
                doctorDTO.getSpecialization(),
                doctorDTO.getDegree(),
                doctorDTO.getPhoneNumber(),
                doctorDTO.getChamberAddress(),
                doctorDTO.getDesignation(),
                doctorDTO.getInstitute(),
                doctorDTO.getCurrentCity(),
                doctorDTO.getAvailableTime(),
                doctorDTO.getWebsiteUrl(),
                Status.PENDING,
                user
                );
        doctorRepository.save(doctor);
    }

    @Override
    public void updaeStatus(String email, Status status) throws NotFoundException {
        User user = userRepository.getUserByEmail(email)
                .orElseThrow(()-> new NotFoundException("Doctor not found ..."));
        Doctor doctor = user.getDoctor();
        doctor.setStatus(status);
        userRepository.save(user);
    }
}
