// 유효성 검증 유틸리티
class Validator {
    constructor() {
        // 특수문자 필터링 패턴
        this.specialCharsPattern = /[<>"&]/g;

        // 개인정보 패턴
        this.personalInfoPatterns = {
            주민번호: /\d{6}[-\s]?\d{7}/g,
            신용카드: /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g,
            계좌번호: /\d{10,14}/g,
            여권번호: /[A-Z]\d{8}/g
        };
    }

    // 전화번호 유효성 검사
    validatePhone(phone) {
        // 숫자만 추출
        const numbers = phone.replace(/[^0-9]/g, '');

        // 휴대폰 번호 패턴 (010, 011, 016, 017, 018, 019)
        const mobilePattern = /^01[0-9]{8,9}$/;

        // 일반 전화번호 패턴
        const telPattern = /^0[2-9]\d{7,9}$/;

        if (mobilePattern.test(numbers)) {
            return { valid: true, type: 'mobile', formatted: numbers };
        } else if (telPattern.test(numbers)) {
            return { valid: true, type: 'tel', formatted: numbers };
        } else {
            return { valid: false, message: '올바른 전화번호 형식이 아닙니다.' };
        }
    }

    // 이메일 유효성 검사
    validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            return { valid: true, optional: true };
        }

        if (emailPattern.test(email)) {
            return { valid: true };
        } else {
            return { valid: false, message: '올바른 이메일 형식이 아닙니다.' };
        }
    }

    // 생년월일 유효성 검사
    validateBirthDate(birthDate) {
        // 6자리 숫자 확인
        if (!/^\d{6}$/.test(birthDate)) {
            return { valid: false, message: '생년월일은 6자리 숫자여야 합니다.' };
        }

        const year = parseInt(birthDate.substring(0, 2));
        const month = parseInt(birthDate.substring(2, 4));
        const day = parseInt(birthDate.substring(4, 6));

        // 월 범위 확인
        if (month < 1 || month > 12) {
            return { valid: false, message: '올바른 월이 아닙니다.' };
        }

        // 일 범위 확인
        if (day < 1 || day > 31) {
            return { valid: false, message: '올바른 일이 아닙니다.' };
        }

        return { valid: true };
    }

    // 주민번호 뒷자리 첫번째 숫자 유효성 검사
    validateGenderDigit(digit) {
        const validDigits = ['1', '2', '3', '4', '5', '6', '7', '8'];

        if (validDigits.includes(digit)) {
            return { valid: true };
        } else {
            return { valid: false, message: '올바른 성별 구분 숫자가 아닙니다.' };
        }
    }

    // 민원 제목 유효성 검사
    validateTitle(title) {
        if (!title || title.trim().length === 0) {
            return { valid: false, message: '제목을 입력해주세요.' };
        }

        if (title.length > 45) {
            return { valid: false, message: '제목은 45자 이하여야 합니다.' };
        }

        // 특수문자 필터링
        const filtered = this.filterSpecialChars(title);

        return { valid: true, filtered: filtered };
    }

    // 민원 내용 유효성 검사
    validateContent(content) {
        if (!content || content.trim().length === 0) {
            return { valid: false, message: '내용을 입력해주세요.' };
        }

        if (content.length > 2000) {
            return { valid: false, message: '내용은 2000자 이하여야 합니다.' };
        }

        // 개인정보 포함 여부 확인
        const personalInfoCheck = this.checkPersonalInfo(content);
        if (personalInfoCheck.found) {
            return {
                valid: false,
                message: `민원 내용에 개인정보(${personalInfoCheck.types.join(', ')})가 포함되어 있습니다.`,
                personalInfo: true
            };
        }

        // 특수문자 필터링
        const filtered = this.filterSpecialChars(content);

        return { valid: true, filtered: filtered };
    }

    // 특수문자 필터링
    filterSpecialChars(text) {
        return text.replace(this.specialCharsPattern, '');
    }

    // 개인정보 포함 여부 확인
    checkPersonalInfo(text) {
        const found = [];

        for (const [type, pattern] of Object.entries(this.personalInfoPatterns)) {
            if (pattern.test(text)) {
                found.push(type);
            }
        }

        return {
            found: found.length > 0,
            types: found
        };
    }

    // 주소 유효성 검사
    validateAddress(address) {
        if (!address || address.trim().length === 0) {
            return { valid: false, message: '주소를 입력해주세요.' };
        }

        // 도로명 주소 또는 지번 주소 패턴
        const roadAddressPattern = /[가-힣]+\s*[가-힣]*\s*\d+/;

        if (roadAddressPattern.test(address)) {
            return { valid: true };
        } else {
            return { valid: false, message: '올바른 주소 형식이 아닙니다.' };
        }
    }

    // 전체 폼 유효성 검사
    validateComplaintForm(formData) {
        const errors = [];

        // 제목 검사
        const titleValidation = this.validateTitle(formData.title);
        if (!titleValidation.valid) {
            errors.push(titleValidation.message);
        }

        // 내용 검사
        const contentValidation = this.validateContent(formData.content);
        if (!contentValidation.valid) {
            errors.push(contentValidation.message);
        }

        // 전화번호 검사 (휴대폰 또는 일반전화 중 하나는 필수)
        const phoneValidation = this.validatePhone(formData.phoneNumber || '');
        const telValidation = this.validatePhone(formData.telNumber || '');

        if (!phoneValidation.valid && !telValidation.valid) {
            errors.push('휴대폰번호 또는 전화번호 중 하나는 필수입니다.');
        }

        // 이메일 검사 (선택사항)
        if (formData.email) {
            const emailValidation = this.validateEmail(formData.email);
            if (!emailValidation.valid) {
                errors.push(emailValidation.message);
            }
        }

        // 개인정보 동의 확인
        if (!formData.agreeCheck) {
            errors.push('개인정보 수집 및 이용에 동의해주세요.');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // PASS 인증 데이터 유효성 검사
    validatePassAuthData(authData) {
        const errors = [];

        // 이름 검사
        if (!authData.userName || authData.userName.trim().length === 0) {
            errors.push('이름을 입력해주세요.');
        }

        // 생년월일 검사
        const birthValidation = this.validateBirthDate(authData.birthDate || '');
        if (!birthValidation.valid) {
            errors.push(birthValidation.message);
        }

        // 성별 검사
        const genderValidation = this.validateGenderDigit(authData.genderDigit || '');
        if (!genderValidation.valid) {
            errors.push(genderValidation.message);
        }

        // 휴대폰번호 검사
        const phoneValidation = this.validatePhone(authData.phoneNumber || '');
        if (!phoneValidation.valid || phoneValidation.type !== 'mobile') {
            errors.push('올바른 휴대폰번호를 입력해주세요.');
        }

        // 통신사 검사
        const validTelecoms = ['SKT', 'KT', 'LGU', 'SKM', 'KTM', 'LGM'];
        if (!validTelecoms.includes(authData.telecom)) {
            errors.push('통신사를 선택해주세요.');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

// 전역 Validator 인스턴스
const validator = new Validator();