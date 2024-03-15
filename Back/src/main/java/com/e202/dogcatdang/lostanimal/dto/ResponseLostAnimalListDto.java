package com.e202.dogcatdang.lostanimal.dto;


import java.time.LocalDate;

import com.e202.dogcatdang.db.entity.LostAnimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ResponseLostAnimalListDto {

	private Long lostAnimalId;
	private String animalType;
	private String breed;
	private String name;
	private Integer age;
	private String gender;

	private LostAnimal.State state;
	private LocalDate lostDate;
	private String lostLocation;

	private String imgUrl;
	private Long userId;
	private String userNickname;

	// Entity -> DTO
	@Builder
	public ResponseLostAnimalListDto(LostAnimal animal) {
		this.lostAnimalId = animal.getLostAnimalId();
		this.animalType = animal.getAnimalType();
		this.breed = animal.getBreed();
		this.name = animal.getName();
		this.age = animal.getAge();
		this.gender = animal.getGender();
		this.state = animal.getState();
		this.lostDate = animal.getLostDate();
		this.lostLocation = animal.getLostLocation();
		// Animal entity와 User entity의 관계에서 userId 가져오기
		this.userId = animal.getUser().getId();
		this.userNickname = animal.getUser().getNickname();

		this.imgUrl = animal.getImgUrl();
	}
}
