package org.genics.pluto.dto.borrower;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class BorrowerAddRequest {

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String whatsapp;

    private String ghanaCard;

    private String location;

}
