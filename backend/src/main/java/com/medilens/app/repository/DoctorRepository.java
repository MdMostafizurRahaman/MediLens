package com.PrescribeCorrect.app.repository;

import com.PrescribeCorrect.app.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor,Long> {
}
