import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, StatusBar, ScrollView,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore';

// ─── AUTH SCREENS ────────────────────────────────────────────────────────────

function SignInScreen({ onSignIn, onGoToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ FIXED: now calls Firebase Auth instead of just setting local state
  const handleSignIn = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onSignIn(userCredential.user);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.authScrollContent}>
          {/* Header */}
          <View style={styles.authHeader}>
            <Text style={styles.authAppName}>📖 Book Manager</Text>
            <Text style={styles.authTagline}>Your personal reading shelf</Text>
          </View>

          {/* Card */}
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>Welcome Back</Text>
            <Text style={styles.authSubtitle}>Sign in to continue</Text>

            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.addButton} onPress={handleSignIn}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.authFooter}>
              <Text style={styles.authFooterText}>Don't have an account? </Text>
              <TouchableOpacity onPress={onGoToSignUp}>
                <Text style={styles.authLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SignUpScreen({ onSignUp, onGoToSignIn }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ✅ FIXED: now calls Firebase createUserWithEmailAndPassword
  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      onSignUp({ ...userCredential.user, name });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.authScrollContent}>
          {/* Header */}
          <View style={styles.authHeader}>
            <Text style={styles.authAppName}>📖 Book Manager</Text>
            <Text style={styles.authTagline}>Your personal reading shelf</Text>
          </View>

          {/* Card */}
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>Create Account</Text>
            <Text style={styles.authSubtitle}>Sign up to get started</Text>

            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Password (min. 6 characters)"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.addButton} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.authFooter}>
              <Text style={styles.authFooterText}>Already have an account? </Text>
              <TouchableOpacity onPress={onGoToSignIn}>
                <Text style={styles.authLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── MAIN APP SCREEN ─────────────────────────────────────────────────────────

function BookManagerScreen({ user, onSignOut }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [books, setBooks] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // ✅ FIXED: saves book to Firestore
  const addBook = async () => {
    if (!title || !author || !genre) {
      alert('Please fill all fields');
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'books'), {
        title,
        author,
        genre,
        userId: user.uid,
      });
      setBooks([...books, { id: docRef.id, title, author, genre }]);
      clearFields();
    } catch (error) {
      alert(error.message);
    }
  };

  // ✅ FIXED: deletes book from Firestore
  const deleteBook = async (id) => {
    try {
      await deleteDoc(doc(db, 'books', id));
      setBooks(books.filter((book) => book.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  const editBook = (book) => {
    setTitle(book.title);
    setAuthor(book.author);
    setGenre(book.genre);
    setEditingId(book.id);
  };

  // ✅ FIXED: updates book in Firestore
  const updateBook = async () => {
    try {
      await updateDoc(doc(db, 'books', editingId), { title, author, genre });
      setBooks(
        books.map((book) =>
          book.id === editingId ? { ...book, title, author, genre } : book
        )
      );
      setEditingId(null);
      clearFields();
    } catch (error) {
      alert(error.message);
    }
  };

  // ✅ FIXED: loads books from Firestore for the current user
  const loadBooks = async () => {
    try {
      const q = query(collection(db, 'books'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const loadedBooks = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBooks(loadedBooks);
    } catch (error) {
      alert(error.message);
    }
  };

  // Load books when screen mounts
  React.useEffect(() => {
    loadBooks();
  }, []);

  const clearFields = () => {
    setTitle('');
    setAuthor('');
    setGenre('');
  };

  const renderItem = ({ item }) => (
    <View style={styles.bookCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.bookTitle}>{item.title}</Text>
      </View>
      <Text style={styles.bookInfo}>
        ✍️ Author: <Text style={styles.bold}>{item.author}</Text>
      </Text>
      <Text style={styles.bookInfo}>
        📚 Genre: <Text style={styles.bold}>{item.genre}</Text>
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={() => editBook(item)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteBook(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.heading}>📖 Book Manager</Text>
        <View style={styles.headerUserRow}>
          <Text style={styles.subHeading}>Hello, {user.displayName || user.email} 👋</Text>
          <TouchableOpacity onPress={onSignOut} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FORM */}
      <View style={styles.formContainer}>
        <TextInput
          placeholder="Enter Book Title"
          placeholderTextColor="#888"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          placeholder="Enter Author Name"
          placeholderTextColor="#888"
          style={styles.input}
          value={author}
          onChangeText={setAuthor}
        />
        <TextInput
          placeholder="Enter Genre"
          placeholderTextColor="#888"
          style={styles.input}
          value={genre}
          onChangeText={setGenre}
        />
        {editingId ? (
          <TouchableOpacity style={styles.updateButton} onPress={updateBook}>
            <Text style={styles.buttonText}>Update Book</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={addBook}>
            <Text style={styles.buttonText}>Add Book</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* BOOK LIST */}
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No books added yet 📖</Text>
        }
      />
    </SafeAreaView>
  );
}

// ─── ROOT NAVIGATOR ───────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('signin');
  const [currentUser, setCurrentUser] = useState(null);

  const handleSignIn = (user) => {
    setCurrentUser(user);
    setScreen('app');
  };

  const handleSignUp = (user) => {
    setCurrentUser(user);
    setScreen('app');
  };

  // ✅ FIXED: calls Firebase signOut before clearing local state
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
    setScreen('signin');
  };

  if (screen === 'signin') {
    return (
      <SignInScreen
        onSignIn={handleSignIn}
        onGoToSignUp={() => setScreen('signup')}
      />
    );
  }

  if (screen === 'signup') {
    return (
      <SignUpScreen
        onSignUp={handleSignUp}
        onGoToSignIn={() => setScreen('signin')}
      />
    );
  }

  return <BookManagerScreen user={currentUser} onSignOut={handleSignOut} />;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  // ── Auth ──
  authScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  authHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },

  authAppName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#392c61',
  },

  authTagline: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },

  authCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    elevation: 6,
    shadowColor: '#392c61',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#392c61',
    marginBottom: 4,
  },

  authSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },

  authFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },

  authFooterText: {
    color: '#888',
    fontSize: 14,
  },

  authLink: {
    color: '#444f80',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // ── Header ──
  header: {
    backgroundColor: '#392c61',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },

  headerUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  subHeading: {
    fontSize: 14,
    color: '#E0E7FF',
  },

  signOutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  signOutText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Form ──
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    fontSize: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  addButton: {
    backgroundColor: '#444f80',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },

  updateButton: {
    backgroundColor: '#8c5f1b',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ── Book Cards ──
  bookCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 18,
    borderRadius: 16,
    elevation: 4,
  },

  cardHeader: {
    marginBottom: 10,
  },

  bookTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },

  bookInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },

  bold: {
    fontWeight: 'bold',
    color: '#222',
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  editButton: {
    backgroundColor: '#336ea3',
    paddingVertical: 10,
    width: '48%',
    borderRadius: 10,
    alignItems: 'center',
  },

  deleteButton: {
    backgroundColor: '#a4392f',
    paddingVertical: 10,
    width: '48%',
    borderRadius: 10,
    alignItems: 'center',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#888',
  },
});