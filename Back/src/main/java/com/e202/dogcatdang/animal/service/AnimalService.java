package com.e202.dogcatdang.animal.service;

import java.io.IOException;
import java.util.List;

import com.e202.dogcatdang.animal.dto.RequestAnimalDto;
import com.e202.dogcatdang.animal.dto.RequestAnimalSearchDto;
import com.e202.dogcatdang.animal.dto.RequestShelterSearchDto;
import com.e202.dogcatdang.animal.dto.ResponseAnimalDto;
import com.e202.dogcatdang.animal.dto.ResponseAnimalListDto;
import com.e202.dogcatdang.animal.dto.ResponseAnimalPageDto;
import com.e202.dogcatdang.animal.dto.ResponseSavedIdDto;
import com.e202.dogcatdang.animal.dto.ResponseShelterAnimalCountDto;
import com.e202.dogcatdang.animal.dto.ResponseShelterAnimalDto;
import com.e202.dogcatdang.animal.dto.ResponseShelterAnimalPageDto;
import com.e202.dogcatdang.db.entity.Animal;
import com.e202.dogcatdang.db.entity.User;
import com.e202.dogcatdang.streaming.dto.ResponseStreamingAnimalDto;

public interface AnimalService {
	ResponseSavedIdDto save(RequestAnimalDto requestAnimalDto, String token) throws IOException;

	ResponseAnimalPageDto findAllAnimals(int page, int recordSize, String token);

	ResponseAnimalDto findById(Long animalId, Long userId);

	Animal update(Long animalId, RequestAnimalDto requestAnimalDto) throws IOException;

	Animal getAnimalById(Long animalId);

	List<ResponseStreamingAnimalDto> findAnimals(Long userId);

	ResponseAnimalPageDto searchAnimals(int page, int recordSize, RequestAnimalSearchDto searchDto, User user);

	ResponseShelterAnimalCountDto countAnimals(Long shelterId);

	ResponseShelterAnimalPageDto findShelterAnimal(int page, int recordSize, Long shelterId);

	ResponseShelterAnimalPageDto searchShelterAnimals(int page, int recordSize, RequestShelterSearchDto searchDto, Long shelterId);
}
