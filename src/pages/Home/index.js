import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Container, Texto, SearchContainer, SearchButton, Input } from './styles';
import Header from '../../components/Header';   
import { Feather } from '@expo/vector-icons';

function Home(){
    return(
        <Container>
            <Header title="Início" />

            <Text style={styles.logoText2}> AVALIE </Text>
						<Text style={styles.tituloStyle}> AVALIE </Text>
            <Text style={styles.textoStyle}>Aplicativo para auxiliar na avaliação de candidatos em processos seletivos       através de questionários</Text>
            <Text style={styles.margemInferiorStyle}>Vinicius Estevão de Oliveira</Text>
        </Container>
    )
}

const styles = StyleSheet.create({
	tituloStyle: {
		fontSize: 54, 
		color: '#7FABBF', 
		textAlign: 'center', 
		marginTop: 30,
		fontWeight: "bold",
	},
	textoStyle: {
		fontSize: 17, 
		color: 'black', 
		textAlign: 'justify', 
		marginTop: 40, 
		width: '95%', 
		textAlign: 'center',
	},
	margemInferiorStyle: {
		fontSize: 18, 
		color: '#7FABBF', 
		textAlign: 'center', 
		position: 'absolute',
  	bottom: 30, 
		width: '95%', 
		fontWeight: "bold",
	},
	logoText2: {
		color: '#AECFEB',
		fontWeight: "bold",
		fontSize: 70,
		textAlign: 'center', 
		width: '100%', 
		position: 'absolute',
		top: 80, 
	},
})

export default Home; 