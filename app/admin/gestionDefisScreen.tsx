import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import BoutonGestion from '@/components/admins/boutonGestion';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
import { useUser } from '@/contexts/UserContext';
import { useNavigation } from '@react-navigation/native';

// Composant BoutonMenu - utilisé dans gestionAnecdotesScreen et gestionDefisScreen
interface ButtonMenuProps {
    first: string;
    second: string;
    third: string;
    onFirstClick: () => void;
    onSecondClick: () => void;
    onThirdClick: () => void;
}

const BoutonMenu: React.FC<ButtonMenuProps> = ({
    first,
    second,
    third,
    onFirstClick,
    onSecondClick,
    onThirdClick,
}) => {
    const [activeButton, setActiveButton] = useState<string>('first');

    const handleButtonClick = (button: string, onClick: () => void) => {
        setActiveButton(button);
        onClick();
    };

    return (
        <View style={menuStyles.container}>
            <TouchableOpacity
                style={[
                    menuStyles.button,
                    activeButton === 'first' && menuStyles.activeButton,
                ]}
                onPress={() => handleButtonClick('first', onFirstClick)}
            >
                <Text style={menuStyles.text}>{first}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    menuStyles.button,
                    activeButton === 'second' && menuStyles.activeButton,
                ]}
                onPress={() => handleButtonClick('second', onSecondClick)}
            >
                <Text style={menuStyles.text}>{second}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    menuStyles.button,
                    activeButton === 'third' && menuStyles.activeButton,
                ]}
                onPress={() => handleButtonClick('third', onThirdClick)}
            >
                <Text style={menuStyles.text}>{third}</Text>
            </TouchableOpacity>
        </View>
    );
};

// Styles pour BoutonMenu
const menuStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
        backgroundColor: Colors.white,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    activeButton: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.accent,
        backgroundColor: Colors.customGray,
    },
    text: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        fontWeight: '500',
        textAlign: 'center',
    },
});


const GestionDefisScreen = () => {
  const [defis, setDefis] = useState([]);
  const [filteredDefis, setFilteredDefis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [disableRefresh, setDisableRefresh] = useState(false);

  const { setUser } = useUser();
  const navigation = useNavigation();

  const fetchAdminDefis = useCallback(async () => {
    setLoading(true);
    setDisableRefresh(true);
    try {
      const response = await apiGet('getAdminChallenges');
      if (response.success) {
        setDefis(response.data);
        setFilteredDefis(response.data);
      } else {
        setError('Erreur lors de la récupération des défis');
      }
    } catch (error : any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setDisableRefresh(false); 
      }, 5000);
    }
  }, [setUser]); 
   
  const handleFilter = (filter) => {
    switch (filter) {
      case 'pending':
        setFilteredDefis(defis.filter((item) => !item.valid && !item.delete));
        break;
      case 'valid':
        setFilteredDefis(defis.filter((item) => !item.delete && item.valid));
        break;
      default:
        setFilteredDefis(defis.filter((item) => !item.delete)); // ne montre pas les supprimés dans "tous les défis"
        break;
    }
  };

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();
    fetchAdminDefis();
    const unsubscribe = navigation.addListener('focus', () => {
        fetchAdminDefis();
      });
  
    return unsubscribe;
}, [navigation, fetchAdminDefis]);

  if (error !== '') {
    return <ErrorScreen error={error} />;
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
        <Header refreshFunction={null} disableRefresh={true} />
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
    <View style={styles.container}>
      <Header refreshFunction={fetchAdminDefis} disableRefresh={disableRefresh}/>
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute="adminScreen" title="Gestion des défis" />
      </View>

      <View>
        <BoutonMenu
          first="Tous" // non supprimés 
          second="En attente"
          third="Validés"
          onFirstClick={() => handleFilter('all')}
          onSecondClick={() => handleFilter('pending')}
          onThirdClick={() => handleFilter('valid')}
        />
      </View>

      <View style={styles.list}>
        <FlatList
          data={filteredDefis}
          renderItem={({ item }) => (
            <BoutonGestion
              title={`Défi ${item.id} : ${item.challenge.title}`}
              subtitle={`Auteur : ${item?.user?.firstName} ${item?.user?.lastName || 'Nom inconnu'}`}
              subtitleStyle={undefined}
              nextRoute="valideDefisScreen"
              id={item.id}
              valide={item.valid}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>Aucun défi correspondant</Text>
          }
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
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 16,
    marginTop:20
  },
});

export default GestionDefisScreen;
