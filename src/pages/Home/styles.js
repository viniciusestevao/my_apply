import styled from 'styled-components';

export const Container = styled.SafeAreaView`
  background-color: #B2D2EA;
  flex: 1;
  padding: 4px 0;
  //align-items: center;
  //justify-content: center;
`;

export const Texto = styled.Text`
    color: #243269;
    font-size: 18px;
    font-weight: bold;
    padding-left: 20px;
    padding-top: 20px;
`;

export const SearchContainer = styled.View`
  flex-direction: row;
  weight: 100%;
  height: 50px;
  align-items: center;
  padding: 0 14px;
  margin-bottom: 8px;
`;

export const Input = styled.TextInput`
  background-color: rgba(255, 255, 255, 0.4);
  width: 85%;
  height: 50px;
  border-radius: 50px;
  padding: 8px 15px;
  font-size: 18px;
  color: #FFF;
`;

export const SearchButton = styled.TouchableOpacity`
  padding: 8px 15px;
  width: 15%;
  height: 50px;
  align-items: center;
  justify-content: center;
`;