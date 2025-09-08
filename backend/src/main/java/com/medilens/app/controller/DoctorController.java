package com.medilens.app.controller;

import com.medilens.app.dto.DoctorDTO;
import com.medilens.app.dto.UserDTO;
import com.medilens.app.exception.NotFoundException;
import com.medilens.app.model.Doctor;
import com.medilens.app.model.Role;
import com.medilens.app.model.Status;
import com.medilens.app.model.User;
import com.medilens.app.service.DoctorService;
import com.medilens.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;
    @Autowired
    private UserService userService;

    @PostMapping("/sign-up")
    public ResponseEntity<?> singUp(@RequestBody User user) {
        user.setRole(Role.ROLE_DOCTOR);
        UserDTO createdUser = userService.save(user);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PostMapping("/add")
    public ResponseEntity<?> addDoctor(Authentication auth, @RequestBody Doctor doctor) throws NotFoundException {
        doctorService.save(auth.getName(), doctor);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<DoctorDTO>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAll());
    }

    @GetMapping("/{email}")
    public ResponseEntity<DoctorDTO> getDoctorById(@PathVariable String email) throws NotFoundException {
        return ResponseEntity.ok(doctorService.getDoctorByEmail(email));
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("")
    public ResponseEntity<?> updateDoctor(Authentication auth, @RequestBody DoctorDTO doctorDTO) throws NotFoundException {
        doctorService.edit(auth.getName(), doctorDTO);
        return ResponseEntity.ok().body("updated. wait until scarification done");
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @DeleteMapping("")
    public ResponseEntity<?> deleteDoctor(Authentication auth) throws NotFoundException {
        doctorService.delete(auth.getName());
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/status/{email}")
    public ResponseEntity<?> updateDoctorActive(@PathVariable String email, @RequestBody Status status) throws NotFoundException {
        doctorService.updaeStatus(email, status);
        return ResponseEntity.ok().build();
    }
}
