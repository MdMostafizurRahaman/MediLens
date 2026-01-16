package com.medilens.app;

import com.medilens.app.model.Role;
import com.medilens.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Simple database verification component
 */
@Component
public class DatabaseVerifier implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        long doctorCount = userRepository.findByRole(Role.ROLE_DOCTOR).size();
        System.out.println("🔍 Database Verification:");
        System.out.println("   👨‍⚕️ Total Doctors in Database: " + doctorCount);

        if (doctorCount > 1000) {
            System.out.println("   ✅ SUCCESS: 1000+ doctors imported successfully!");
            System.out.println("   📊 Bangladesh doctors database is ready!");
        } else if (doctorCount > 0) {
            System.out.println("   ⚠️  PARTIAL: Some doctors imported (" + doctorCount + ")");
        } else {
            System.out.println("   ❌ ERROR: No doctors found in database");
        }
    }
}