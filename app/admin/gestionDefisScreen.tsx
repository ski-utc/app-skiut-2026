/*import BoutonMenu from '@/components/admins/boutonMenu';
import BoutonGestion from '@/components/admins/boutonGestion';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import Header from '../../components/header';
import Banner from '@/components/divers/bannièreReponse';
import { useUser } from '@/contexts/UserContext';
import ChallengeProof from '../../components/challenges/proof';
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonNavigation from '@/components/divers/boutonNavigation';
import { MessageCirclePlus } from 'lucide-react-native';
import { apiPost } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';

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
    const [proofs, setProofs] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [quantity, setQuantity] = useState(10);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [responseMessage, setResponseMessage] = useState('');
    const [responseSuccess, setResponseSuccess] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const navigation = useNavigation();

    const { setUser } = useUser();

    const fetchProofs = async (incrementalLoad = false) => {
        if (!incrementalLoad) setLoading(true);
        else setLoadingMore(true);

        try {
            const response = await apiPost('getAdminChallenges', { 'quantity': quantity });
            if (response.success) {
                if (response.data.length < quantity) {
                    setHasMoreData(false);
                }
                setProofs(response.data);
            } else {
                setError('Une erreur est survenue lors de la récupération des anecdotes');
            }
        } catch (error) {
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchProofs();
    }, []);

    const handleLoadMore = () => {
        if (hasMoreData && !loading && !loadingMore) {
            setQuantity(prev => prev + 10);
            fetchProofs(true);
        }
    };

    if (error != '') {
        return (
            <ErrorScreen error={error} />
        )
    }

    if (loading) {
        return (
            <View
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Header />
                <View
                    style={{
                        width: '100%',
                        flex: 1,
                        backgroundColor: Colors.white,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator size="large" color={Colors.gray} />
                </View>
            </View>
        );
    }

    return (
        <View style={{
            height: '100%',
            width: '100%',
            flex: 1,
            backgroundColor: 'white',
            paddingBottom: 8,
        }}>
            <Banner message={responseMessage} success={responseSuccess} show={showBanner} />
            <Header refreshFunction={fetchProofs} />

            <View style={{
                width: '100%',
                paddingHorizontal: 20,
                paddingBottom: 16,
            }}>
                <BoutonRetour previousRoute="adminScreen" title="Gestion des défis" />
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

            <FlatList
                data={proofs}
                renderItem={({ item }) => (
                    <ChallengeProof
                        id={item.id}
                        file={item.file}
                        nbLikes={item.nbLikes}
                        valid={item.valid}
                        alert={item.alert}
                        delete={item.delete}
                        authorId={item.authorId}
                        roomId={item.roomId}
                        challengeId={item.challengeId}
                        refresh={fetchProofs}
                        setError={setError}
                        setResponseMessage={setResponseMessage}
                        setResponseSuccess={setResponseSuccess}
                        setShowBanner={setShowBanner}
                    />
                )}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={() => <View style={{ height: 36 }} />}
                onEndReached={handleLoadMore}
                ListFooterComponent={() =>
                    loadingMore ? <ActivityIndicator size="small" color={Colors.gray} /> : <View style={{ height: 25 }} />
                }
            />
        </View>
    );
};

export default GestionDefisScreen;
*/

import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import BoutonMenu from '@/components/admins/boutonMenu';
import BoutonGestion from '@/components/admins/boutonGestion';
import { useNavigation } from '@react-navigation/native';

const defiControls = [
    { title: 'Défi n°13', subtitle: 'Chambre Projet X', nextRoute: 'valideDefisScreen' },
    { title: 'Défi n°6', subtitle: 'Chambre Les skieuses', nextRoute: 'valideDefisScreen' },
    { title: 'Défi n°16', subtitle: 'Chambre Marmotte', nextRoute: 'valideDefisScreen' },
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
                <BoutonRetour previousRoute="adminScreen" title="Gestion des défis" />
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
    },
    listContentContainer: {
        paddingHorizontal: 20,
    },
});

export default GestionDefisScreen;