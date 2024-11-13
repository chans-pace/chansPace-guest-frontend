import { SignupFormStyled } from './styled';
import { message, Input, Button } from 'antd';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CheckboxGroup from '../CheckboxGroup';
import { postSignup } from '@/pages/api/userApi';
import Buttons from '../Buttons';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { AxiosError } from 'axios'; // AxiosError 타입을 import
import dayjs from 'dayjs';
import { SignupCoupon } from '@/pages/api/couponApi';
import { useFormik } from 'formik';
import { sendAuthNumber } from '@/pages/api/nodemailerApi';
import Link from 'next/link';

interface CheckBoxItem {
  value: string;
  children: string;
  checked: boolean;
  required: boolean;
}

const SignupForm = () => {
  const router = useRouter();

  //체크박스의 정보를 담고 있는 상태 배열
  const [smallCheckBoxs, setSmallCheckBoxs] = useState<CheckBoxItem[]>([
    {
      value: 'check1', //체크박스 고유값
      children: '서비스 이용 약관(필수)', //체크박스 옆에 표시될 텍스트
      checked: false, //체크박스가 선택되었는지
      required: true, //해당 체크박스 선택이 필수인지 구분
    },
    {
      value: 'check2',
      children: '개인정보 수집 이용 (필수)',
      checked: false,
      required: true,
    },
    {
      value: 'check3',
      children: '마케팅 정보 수신 동의 (선택)',
      checked: false,
      required: false,
    },
  ]);

  //모든 체크박스가 선택되었는지
  const [isAllChecked, setIsAllChecked] = useState(false);
  //필수 체크박스가 선택되지 않았을 경우의 에러 메세지
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // 에러 메시지 상태 추가
  const [duplicateError, setDuplicateError] = useState('');
  //코드 발송 여부
  const [isCodeSent, setIsCodeSent] = useState(false);
  //서버에서 받은 인증코드 저장
  const [serverAuthCode, setServerAuthCode] = useState<string>('');
  //이메일 인증 완료 여부
  const [isVerified, setIsVerified] = useState(false);

  //전체 체크박스 선택
  const onAllCheck = (e: CheckboxChangeEvent) => {
    //체크박스 상태 가져오기
    const checked = e.target.checked;
    //체크박스의 상태 업데이트
    setIsAllChecked(checked);
    //모든 체크박스의 checked상태를 업데이트
    setSmallCheckBoxs(smallCheckBoxs.map((x) => ({ ...x, checked: checked })));
  };

  //개별 체크박스 선택
  const onSingleCheck = (e: CheckboxChangeEvent) => {
    //클릭한 체크박스의 값을 저장
    const targetValue = e.target.value;
    setSmallCheckBoxs(
      smallCheckBoxs.map((checkBox) =>
        targetValue === checkBox.value
          ? //해당 체크박스의 checked상태를 반전시킴
            { ...checkBox, checked: !checkBox.checked }
          : checkBox
      )
    );
  };

  //개별 체크박스가 변경될때마다 호출되어 모든 체크박스가 선택되면 전체 체크박스 상태를 업데이트
  //every(): 배열에 모든 요소가 특정 조건을 만족하는지 확인될때 사용
  useEffect(() => {
    setIsAllChecked(smallCheckBoxs.every((x) => x.checked));
  }, [smallCheckBoxs]);

  const formik = useFormik({
    initialValues: {
      email: 'test@daum.net',
      password: 'password1234!',
      confirm: 'password1234!',
      authCode: '', // 인증 코드 입력 필드 추가
    },
    validate: (values) => {
      const errors: { email?: string; password?: string; confirm?: string } =
        {};

      if (!values.email) {
        errors.email = '이메일을 입력해주세요';
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
      ) {
        errors.email = '유효하지 않은 이메일 주소입니다';
      }

      if (!values.password) {
        errors.password = '비밀번호를 입력해주세요';
      } else if (
        !/(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{10,15}/.test(values.password)
      ) {
        errors.password =
          '영문자, 숫자, 특수문자를 포함하여 10-15자로 입력해주세요';
      }

      if (values.confirm !== values.password) {
        errors.confirm = '비밀번호가 일치하지 않습니다';
      }

      return errors;
    },
    onSubmit: async (values) => {
      const { email, password } = values;
      const allChecked = smallCheckBoxs.every((checkbox) => {
        if (checkbox.required) return checkbox.checked;
        return true;
      });

      if (!allChecked) {
        setErrorMessage('필수 항목을 동의해주세요');
        return;
      }

      const agreed =
        allChecked || smallCheckBoxs.some((checkbox) => checkbox.checked);

      try {
        const response = await postSignup({
          email,
          password,
          role: 'user',
          agreed,
        });

        const calculateCouponExpiration = (createdAt: Date) => {
          const createdDate = new Date(createdAt);
          const expirationDate = new Date(createdDate);
          expirationDate.setDate(createdDate.getDate() + 30);
          return dayjs(expirationDate).format('YYYY-MM-DD');
        };

        const userId = response.data.id;
        const expirationDate = calculateCouponExpiration(
          response.data.createdAt
        );
        const couponData = { userId, expirationDate, couponId: 1 };
        await SignupCoupon(couponData);

        router.push('/login');
        message.success(response.message);
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response && axiosError.response.status === 400) {
          setDuplicateError('이미 존재하는 아이디입니다.');
        } else {
          message.error('회원가입 실패');
        }
      }
    },
  });

  const handleSendAuthCode = async () => {
    try {
      const response = await sendAuthNumber(formik.values.email);
      console.log(response);
      if (response && response.result) {
        message.success(response.message);
        setServerAuthCode(String(response.authNumber)); // 문자열로 변환하여 저장
        setIsCodeSent(true);
      } else if (response && !response.result) {
        // 중복된 이메일의 경우 메시지 처리
        message.error(response.message);
      } else {
        message.error('알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.status === 404) {
        message.error('이미 존재하는 회원입니다.');
      } else {
        message.error('인증 코드 전송에 실패했습니다.');
      }
    }
  };

  const handleVerifyCode = () => {
    if (formik.values.authCode === serverAuthCode) {
      message.success('이메일 인증이 완료되었습니다.');
      setIsVerified(true);
    } else {
      message.error('인증 코드가 일치하지 않습니다.');
      setIsVerified(false);
    }
  };

  return (
    <SignupFormStyled>
      <form className="form" onSubmit={formik.handleSubmit}>
        <Link href={'/'}>
          <p className="formLogo">ChancePace</p>
        </Link>
        <Input
          name="email"
          placeholder="이메일"
          onChange={formik.handleChange}
          value={formik.values.email}
          onBlur={formik.handleBlur}
          disabled={isVerified}
          className="email-confirm"
        />{' '}
        <Button
          htmlType="button"
          onClick={handleSendAuthCode}
          disabled={!formik.values.email || isCodeSent}
        >
          인증받기
        </Button>
        {formik.touched.email && formik.errors.email ? (
          <p className="error">{formik.errors.email}</p>
        ) : (
          <p className="error"></p>
        )}
        {isCodeSent && (
          <>
            <Input
              name="authCode"
              placeholder="인증번호 입력"
              onChange={formik.handleChange}
              value={formik.values.authCode}
              onBlur={formik.handleBlur}
              className="email-confirm number-confirm"
            />{' '}
            <Button onClick={handleVerifyCode} htmlType="button">
              인증하기
            </Button>
            {formik.errors.authCode && (
              <p className="error">{formik.errors.authCode}</p>
            )}
          </>
        )}
        <Input.Password
          name="password"
          placeholder="영문자,숫자,특수문자를 포함하여 10 - 15자로 입력해주세요"
          onChange={formik.handleChange}
          value={formik.values.password}
          onBlur={formik.handleBlur}
        />
        {formik.touched.password && formik.errors.password ? (
          <p className="error">{formik.errors.password}</p>
        ) : (
          <p className="error"></p>
        )}
        <Input.Password
          name="confirm"
          placeholder="비밀번호 확인"
          onChange={formik.handleChange}
          value={formik.values.confirm}
          onBlur={formik.handleBlur}
        />
        {formik.touched.confirm && formik.errors.confirm ? (
          <p className="error">{formik.errors.confirm}</p>
        ) : (
          <p className="error"></p>
        )}
        <CheckboxGroup
          checkboxes={smallCheckBoxs}
          onAllCheck={onAllCheck}
          onSingleCheck={onSingleCheck}
          isAllChecked={isAllChecked}
        />
        {errorMessage ? (
          <p className="error">{errorMessage}</p>
        ) : (
          <p className="error"></p>
        )}
        <Button
          loading={false}
          htmlType="submit"
          disabled={!isVerified}
          className="signup-button"
        >
          회원가입
        </Button>
      </form>
    </SignupFormStyled>
  );
};

export default SignupForm;
