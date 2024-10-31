import { useEffect, useState } from 'react';
import { DateTimePickerStyled } from './styled';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

interface DateTimePickerProps {
  businessStartTime: number;
  businessEndTime: number;
  price: number;
  onTimeSelect: (totalTime: number, startTime: number, endTime: number) => void;
}
const DateTimePicker = ({
  businessEndTime,
  businessStartTime,
  price,
  onTimeSelect,
}: DateTimePickerProps) => {
  //사용자가 선택한 날짜 저장하는 상태
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  //예약 시작시간의 인덱스
  const [startTime, setStartTime] = useState<number | null>(null);
  //예약 종료시간 인덱스
  const [endTime, setEndTime] = useState<number | null>(null);

  //업체의 오픈시간부터 마감시간까지의 시간대를 배열로 만듬
  const timeSlots = Array.from(
    { length: businessEndTime - businessStartTime },
    (_, i) => businessStartTime + i
  );

  useEffect(() => {
    if (startTime !== null) {
      //endTime이 null이면 finalEndTime을 startTime으로 지정
      //한시간을 예약가능하게 하기위해
      const finalEndTime = endTime ?? startTime;
      onTimeSelect(
        finalEndTime - startTime + 1, //총 시간
        businessStartTime + startTime, //시작시간
        businessStartTime + finalEndTime //종료시간
      );
    }
  }, [startTime, endTime, onTimeSelect]);

  //시간 슬롯 클릭이벤트
  const handleTimeClick = (index: number) => {
    if (startTime === null) {
      setStartTime(index);
      setEndTime(null);
      //end값이 null일때
    } else if (startTime !== null && endTime === null) {
      //시작 시간 이후를 클릭하면 종료시간 설정
      if (index > startTime) {
        setEndTime(index);
        //index < startTime or index = startTime
      } else {
        setStartTime(index);
        setEndTime(null);
      }
      //종료시간이 설정된 상태에서 새로 선택할때 시작시간 초기화
    } else {
      setStartTime(index);
      setEndTime(null);
    }
  };

  //특정 시간 슬롯이 선택된 상태인지 확인하는 함수
  const isSelected = (index: number) => {
    if (startTime !== null) {
      if (endTime !== null) {
        return index >= startTime && index <= endTime;
      }
      return index === startTime;
    }
    return false;
  };

  return (
    <DateTimePickerStyled>
      <DatePicker
        dateFormat="yyyy.MM.dd"
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        placeholderText="날짜를 선택해주세요"
        className="custom-datepicker"
        minDate={new Date()} // 오늘 이전 날짜는 선택 불가
      />

      <div className="time-select-title">
        <p>시간선택</p>
        {startTime !== null && (
          <div className="selected-time-info">
            <p>
              {`${businessStartTime + startTime}:00`} ~{' '}
              {endTime !== null
                ? `${businessStartTime + endTime + 1}:00`
                : `${businessStartTime + startTime + 1}:00`}
              , {endTime !== null ? endTime - startTime + 1 : 1}
              시간
            </p>
          </div>
        )}
      </div>
      <div className="swiper-container">
        <Swiper
          spaceBetween={0}
          slidesPerView={5}
          pagination={{ clickable: true }}
        >
          {timeSlots.map((time, index) => (
            <SwiperSlide key={index}>
              <div key={index}>
                <div className="time-boundary">{`${time}`}</div>
                <div
                  className={`time-slot ${
                    isSelected(index) ? 'selected' : 'unselected'
                  }`}
                  onClick={() => handleTimeClick(index)}
                >
                  <div className="price">{price.toLocaleString()}원</div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </DateTimePickerStyled>
  );
};
export default DateTimePicker;
