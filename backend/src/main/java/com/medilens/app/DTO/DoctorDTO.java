package com.medilens.app.DTO;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.medilens.app.model.Status;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DoctorDTO {
    private String firstName;
    private String lastName;
    private String email;
    private List<String> specialization;

    private List<String> degree;

    private List<String> phoneNumber;
    private String chamberAddress;

    private String designation;
    private String institute;
    private String currentCity;

    private String availableTime;

    private String websiteUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
}
