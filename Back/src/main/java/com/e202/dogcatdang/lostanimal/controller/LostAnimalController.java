package com.e202.dogcatdang.lostanimal.controller;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.e202.dogcatdang.animal.dto.ResponseAnimalPageDto;
import com.e202.dogcatdang.db.entity.LostAnimal;
import com.e202.dogcatdang.lostanimal.dto.RequestLostAnimalDto;
import com.e202.dogcatdang.lostanimal.dto.RequestLostAnimalSearchDto;
import com.e202.dogcatdang.lostanimal.dto.ResponseLostAnimalDto;
import com.e202.dogcatdang.lostanimal.dto.ResponseLostAnimalPageDto;
import com.e202.dogcatdang.lostanimal.dto.ResponseSavedIdDto;
import com.e202.dogcatdang.lostanimal.service.LostAnimalService;
import com.e202.dogcatdang.user.jwt.JWTUtil;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@RestController
@RequestMapping("/api/lost-animals")
public class LostAnimalController {

	private JWTUtil jwtUtil;
	private final LostAnimalService lostAnimalService;

	// 실종 동물 정보 등록
	@PostMapping("")
	public ResponseEntity<ResponseSavedIdDto> registerLostAnimal(@RequestHeader("Authorization") String token, @RequestBody RequestLostAnimalDto requestLostAnimalDto) throws IOException {

		ResponseSavedIdDto responseSavedIdDto = lostAnimalService.save(requestLostAnimalDto, token);
		return ResponseEntity.ok(responseSavedIdDto);
	}

	/* 동물 목록 조회
*  모든 동물을 페이지로 불러옴
   1페이지에 최대 8개의 데이터
*/
	@GetMapping("")
	public ResponseEntity<ResponseLostAnimalPageDto> findAll(@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "8") int recordSize) {
		ResponseLostAnimalPageDto animalPage = lostAnimalService.findAll(page, recordSize);

		// model.addAttribute 대신 ResponseEntity에 데이터를 담아 반환
		return ResponseEntity.ok(animalPage);
	}

	/* 실종 동물 정보 상세 조회
		동물 데이터 하나를 불러옴 */
	@GetMapping("/{lostAnimalId}")
	public ResponseEntity<ResponseLostAnimalDto> findLostAnimal(@PathVariable long lostAnimalId) {
		ResponseLostAnimalDto lostAnimalDto = lostAnimalService.findById(lostAnimalId);
		return ResponseEntity.ok(lostAnimalDto);
	}

	/* 실종 동물 정보 수정 */
	@PutMapping("/{lostAnimalId}")
	public ResponseEntity<Long> update(@PathVariable Long lostAnimalId, @RequestHeader("Authorization") String token, @RequestBody RequestLostAnimalDto requestLostAnimalDto) throws IOException {
		// 토큰에서 사용자 아이디(pk) 추출
		Long loginUserId = jwtUtil.getUserId(token.substring(7));

		// 수정할 동물 정보 가져오기
		ResponseLostAnimalDto existingAnimal = lostAnimalService.findById(lostAnimalId);
		// 수정할 동물의 작성자 아이디(pk) 가져오기
		Long authorId = existingAnimal.getUserId();

		// 현재 로그인한 사용자와 동물의 작성자 아이디 비교
		// 만약 일치하지 않으면 권한 없음 반환
		if (!loginUserId.equals(authorId)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
		}

		LostAnimal animal = lostAnimalService.update(lostAnimalId, requestLostAnimalDto);
		return ResponseEntity.ok(animal.getLostAnimalId());
	}

	// 조건에 맞는 실종 동물 검색
	@PostMapping("/filter")
	public ResponseEntity<ResponseLostAnimalPageDto> filterLostAnimals(@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "8") int recordSize, @RequestBody RequestLostAnimalSearchDto searchDto) {

		ResponseLostAnimalPageDto searchResult = lostAnimalService.searchAnimals(page, recordSize, searchDto);
		if (searchResult.getLostAnimalDtoList().isEmpty()) {
			return ResponseEntity.noContent().build(); // 검색 결과가 없을 때
		} else {
			return ResponseEntity.ok(searchResult); // 검색 결과가 있을 때
		}
	}
}
