import React from 'react';
//import { View, Text } from 'react-native';

import { Container, Texto, SearchContainer, SearchButton, Input } from './styles';
import Header from '../../components/Header';   
import { Feather } from '@expo/vector-icons';

function Home(){
    return(
        <Container>
            <Header title="Página Inicial" />

            <SearchContainer>
                <Input placeholder='O que deseja pesquisar ?' placeholderTextColor="#48B"/>
                <SearchButton>
                    <Feather name='search' size={26} color="#FFF"/>
                </SearchButton>
            </SearchContainer>

            <Texto>Esta é a tela inicial</Texto>
        </Container>
    )
}

export default Home; 