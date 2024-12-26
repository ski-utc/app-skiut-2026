import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import BoutonGestion from '@/components/admins/boutonGestion';
import { useNavigation } from '@react-navigation/native';
import BoutonNavigation from '@/components/divers/boutonNavigation';
import { MessageCirclePlus } from 'lucide-react-native';

const notifControls = [
    { title: 'Notification 1', subtitle: 'Date notif 1', nextRoute: 'valideNotificationsScreen' },
    { title: 'Notification 2', subtitle: 'Date notif 2', nextRoute: 'valideNotificationsScreen' },
    { title: 'Notification 3', subtitle: 'Date notif 3', nextRoute: 'valideNotificationsScreen' },
];

const GestionNotificationsScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.headerContainer}>
                <BoutonRetour previousRoute="adminScreen" title="Gestion des notifications" />
            </View>
            
            <View style={styles.list}>
                <FlatList
                    data={notifControls}
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
            <View style={styles.bottomButtonContainer}>
            <BoutonNavigation
                nextRoute={"notificationsForm"}
                title={"Rédiger une notification"}
                IconComponent={MessageCirclePlus}
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
    },
    listContentContainer: {
        paddingHorizontal: 20,
    },
    bottomButtonContainer: {
      position: 'absolute',
      bottom: 20, 
      width: '100%',
      paddingHorizontal: 20, 
  },
});

export default GestionNotificationsScreen;
