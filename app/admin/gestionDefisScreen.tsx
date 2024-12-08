import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import BoutonMenu from '@/components/admins/boutonMenu';
import BoutonGestion from '@/components/admins/boutonGestion';
import { useNavigation } from '@react-navigation/native';

const defiControls = [
    { title: 'Défi n°13', subtitle: 'Chambre Projet X', nextRoute: 'ValideDefisScreen' },
    { title: 'Défi n°6', subtitle: 'Chambre Les skieuses', nextRoute: 'ValideDefisScreen' },
    { title: 'Défi n°16', subtitle: 'Chambre Marmotte', nextRoute: 'ValideDefisScreen' },
];

const handleFirstClick = () => {
    console.log('Filter data: En attente');
    // Add filtering logic for "En attente"
};

const handleSecondClick = () => {
    console.log('Filter data: Signalés');
    // Add filtering logic for "Signalés"
};

const handleThirdClick = () => {
    console.log('Filter data: Tous les défis');
    // Add filtering logic for "Tous les défis"
};

const GestionDefisScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.headerContainer}>
                <BoutonRetour previousRoute="AdminScreen" title="Gestion des défis" />
            </View>

            <View>
                <BoutonMenu 
                    first="En attente" 
                    second="Signalés" 
                    third="Tous les défis" 
                    onFirstClick={handleFirstClick} 
                    onSecondClick={handleSecondClick} 
                    onThirdClick={handleThirdClick} 
                />
            </View>

            
            <View style={styles.list}>
                <FlatList
                    data={defiControls}
                    renderItem={({ item }) => (
                        <BoutonGestion 
                            title={item.title} 
                            subtitle={item.subtitle} 
                            nextRoute={item.nextRoute}  
                        />
                    )}
                    keyExtractor={(item) => item.title} 
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        flex: 1,
        backgroundColor: 'white',
        paddingBottom: 8,
    },
    headerContainer: {
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    list: {
        width: '100%',
        marginTop: 20,
    },
    listContentContainer: {
        paddingHorizontal: 20,
    },
});

export default GestionDefisScreen;
