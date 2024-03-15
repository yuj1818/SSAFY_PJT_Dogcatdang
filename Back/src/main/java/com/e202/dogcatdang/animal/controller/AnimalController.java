package com.e202.dogcatdang.animal.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.e202.dogcatdang.animal.dto.RequestAnimalDto;
import com.e202.dogcatdang.animal.dto.RequestAnimalSearchDto;
import com.e202.dogcatdang.animal.dto.ResponseAnimalDto;
import com.e202.dogcatdang.animal.dto.ResponseAnimalPageDto;
import com.e202.dogcatdang.animal.dto.ResponseSavedIdDto;
import com.e202.dogcatdang.animal.service.AnimalLikeService;
import com.e202.dogcatdang.animal.service.AnimalService;
import com.e202.dogcatdang.db.entity.Animal;
import com.e202.dogcatdang.db.entity.User;
import com.e202.dogcatdang.user.Service.UserProfileService;
import com.e202.dogcatdang.user.jwt.JWTUtil;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@RestController
@RequestMapping("/api/animals")
public class AnimalController {

	private JWTUtil jwtUtil;
	private final AnimalService animalService;
	private final AnimalLikeService animalLikeService;
	private final UserProfileService userService;

	// 동물 정보 등록
	@PostMapping("")
	public ResponseEntity<ResponseSavedIdDto> registerAnimal(@RequestHeader("Authorization") String token, @RequestBody RequestAnimalDto requestAnimalDto) throws IOException {

		ResponseSavedIdDto responseSavedIdDto = animalService.save(requestAnimalDto, token);
		return ResponseEntity.ok(responseSavedIdDto);
	}

	/* 동물 목록 조회
	*  모든 동물을 페이지로 불러옴
	   1페이지에 최대 8개의 데이터
	*/
	@GetMapping("")
	public ResponseEntity<ResponseAnimalPageDto> findAll(@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "8") int recordSize, @RequestHeader("Authorization") String token) {
		ResponseAnimalPageDto animalPage = animalService.findAllAnimals(page, recordSize, token);

		// model.addAttribute 대신 ResponseEntity에 데이터를 담아 반환
		return ResponseEntity.ok(animalPage);
	}

	/* 동물 정보 상세 조회
		동물 데이터 하나를 불러옴 */
	@GetMapping("/{animalId}")
	public ResponseEntity<ResponseAnimalDto> findAnimal(@PathVariable long animalId, @RequestHeader("Authorization") String token) {
		// 토큰에서 사용자 아이디(pk) 추출
		Long loginUserId = jwtUtil.getUserId(token.substring(7));

		ResponseAnimalDto animalDto = animalService.findById(animalId, loginUserId);
		return ResponseEntity.ok(animalDto);
	}

	/* 동물 정보 수정
	   로그인한 현재 유저의 각 동물 별 좋아요 여부 확인할 수 있도록 로그인 토큰을 요구함
	*/
	@PutMapping("/{animalId}")
	public ResponseEntity<Long> update(@PathVariable Long animalId, @RequestHeader("Authorization") String token, @RequestBody RequestAnimalDto requestAnimalDto) throws IOException {
		// 토큰에서 사용자 아이디(pk) 추출
		Long loginUserId = jwtUtil.getUserId(token.substring(7));

		// 수정할 동물 정보 가져오기
		ResponseAnimalDto existingAnimal = animalService.findById(animalId, loginUserId);
		// 수정할 동물의 작성자 아이디(pk) 가져오기
		Long authorId = existingAnimal.getUserId();

		// 현재 로그인한 사용자와 동물의 작성자 아이디 비교
		// 만약 일치하지 않으면 권한 없음 반환
		if (!loginUserId.equals(authorId)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
		}

		Animal animal = animalService.update(animalId, requestAnimalDto);
		return ResponseEntity.ok(animal.getAnimalId());
	}

	// 동물에 대한 좋아요 등록
	@PostMapping("/{animalId}/likes")
	public ResponseEntity<String> likeAnimal(@PathVariable Long animalId, @RequestHeader("Authorization") String token) {
		// 현재 로그인한 사용자 정보 가져오기
		Long userId = jwtUtil.getUserId(token.substring(7));

		// 동물 좋아요 서비스 호출
		Animal animal = animalService.getAnimalById(animalId);
		animalLikeService.likeAnimal(userId, animal);

		return ResponseEntity.ok(userId + "가" + animalId + "의 관심 동물을 등록하였습니다.");
	}

	// 동물에 대한 좋아요 취소
	@DeleteMapping("/{animalId}/likes")
	public ResponseEntity<String> unlikeAnimal(@PathVariable Long animalId, @RequestHeader("Authorization") String token) {
		// 현재 로그인한 사용자 정보 가져오기
		Long userId = jwtUtil.getUserId(token.substring(7));

		// 동물 좋아요 서비스 호출
		Animal animal = animalService.getAnimalById(animalId);
		animalLikeService.unlikeAnimal(userId, animal);

		return ResponseEntity.ok(userId + "가" + animalId + "의 관심 동물 등록을 취소하였습니다.");
	}

	// 특정 동물에 대한 현재 로그인한 사용자의 좋아요 여부 확인
	@GetMapping("/{animalId}/likes")
	public ResponseEntity<Map<String, Boolean>> isAnimalLikedByCurrentUser(
		@PathVariable Long animalId,
		@RequestHeader("Authorization") String token) {

		// 동물 정보 가져오기
		Animal animal = animalService.getAnimalById(animalId);

		// 현재 로그인한 사용자 정보 가져오기
		Long userId = jwtUtil.getUserId(token.substring(7));
		User user = userService.findById(userId);

		// 동물의 좋아요 여부 조회
		boolean isLike = animalLikeService.isAnimalLikedByUser(animal, user);

		// 결과를 Map 형태로 응답
		Map<String, Boolean> response = new HashMap<>();
		response.put("isLike", isLike);

		return ResponseEntity.ok(response);
	}

	// 조건에 맞는 보호 동물 검색
	@PostMapping("/filter")
	public ResponseEntity<ResponseAnimalPageDto> filterAnimals(@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "8") int recordSize, @RequestHeader("Authorization") String token, @RequestBody RequestAnimalSearchDto searchDto) {

		// 현재 로그인한 사용자 정보 가져오기
		Long userId = jwtUtil.getUserId(token.substring(7));
		User user = userService.findById(userId);

		ResponseAnimalPageDto searchResult = animalService.searchAnimals(page, recordSize, searchDto, user);
		if (searchResult.getAnimalDtoList().isEmpty()) {
			return ResponseEntity.noContent().build(); // 검색 결과가 없을 때
		} else {
			return ResponseEntity.ok(searchResult); // 검색 결과가 있을 때
		}
	}

}
