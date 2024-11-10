import styled from 'styled-components';

export const ItemListStyled = styled.div`
  width: 100%;
  height: 370px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.23922);
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  .itemImg {
    margin: auto;
    height: 270px;
    display: flex;
    align-items: center;
    border-radius: ${({ theme }) => theme.borderRadius};
    object-fit: cover;
    .img {
      width: 100%;
      border-radius: 8px 8px 0 0;
      height: 100%;
      object-fit: cover;
    }
  }
  .item-bottom {
    display: flex;
    justify-content: space-between;
    padding: 5px;

    .itemText {
      display: flex;
      flex-direction: column;
      justify-content: center;
      p {
        margin-bottom: 5px;
        &:nth-of-type(1) {
          font-weight: bold;
          color: #363636;
        }
        &:nth-of-type(2) {
          font-size: ${({ theme }) => theme.fontSizes.sm};
          color: gray;
        }
        &:nth-of-type(3) {
          font-size: ${({ theme }) => theme.fontSizes.sm};
        }
      }
      .rate {
        display: flex;
        .rate-number {
          margin-left: 5px;
          font-weight: 400;
          font-size: 13px;
        }
      }
    }
    .bookmark-icon {
      font-size: 1.2rem;
      color: lightgray;
    }
    .bookmark-icon.active {
      font-size: 1.2rem;
      color: #8c73d8;
    }
    .price {
      display: flex;
      align-items: center;
      .discount {
        display: flex;
        align-items: center;
        .discount-tag {
          font-size: 10px;
          margin-left: 10px;
          background-color: orange;
          padding: 3px;
          border-radius: 8px;
          color: white;
        }
      }
    }
  }
`;
