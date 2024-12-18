import { message } from 'antd';
import axios, { AxiosError } from 'axios';
interface ErrorResponseData {
  message: string;
}

const isLocal = process.env.NODE_ENV === 'development';

const API_URL = `${
  isLocal
    ? `http://${process.env.NEXT_PUBLIC_LOCAL_HOST}:${process.env.NEXT_PUBLIC_LOCAL_PORT}`
    : `http://${process.env.NEXT_PUBLIC_SERVER_HOST}:${process.env.NEXT_PUBLIC_SERVER_PORT}`
}/api/space`;

export const getSpace = async () => {
  try {
    const response = await axios.get(`${API_URL}/get-space`);
    // console.log(response,'리스펀스')
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponseData>;
    if (axiosError.response) {
      message.error(axiosError.response.data.message);
    }
  }
};

export const getSearchSpace = async (value: string) => {
  try {
    const response = await axios.get(`${API_URL}/get-search-space`, {
      params: { query: value },
    });
    return response.data;
  } catch (error) {
    console.error('공간을 불러오지 못했습니다.', error);
    throw error;
  }
};

export const getOneSpace = async (spaceId: number) => {
  try {
    const response = await axios.get(
      `${API_URL}/get-one-space?spaceId=${spaceId}`,
      {
        params: { spaceId },
      }
    );
    return response.data;
  } catch (error) {
    console.error('공간조회 실패', error);
    throw error;
  }
};
