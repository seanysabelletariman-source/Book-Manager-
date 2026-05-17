import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function App() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');

  const [books, setBooks] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // ADD BOOK
  const addBook = () => {
    if (!title || !author || !genre) {
      alert('Please fill all fields');
      return;
    }

    const newBook = {
      id: Date.now().toString(),
      title,
      author,
      genre,
    };

    setBooks([...books, newBook]);
    clearFields();
  };

  // DELETE BOOK
  const deleteBook = (id) => {
    const updatedBooks = books.filter((book) => book.id !== id);
    setBooks(updatedBooks);
  };

  // EDIT BOOK
  const editBook = (book) => {
    setTitle(book.title);
    setAuthor(book.author);
    setGenre(book.genre);
    setEditingId(book.id);
  };

  // UPDATE BOOK
  const updateBook = () => {
    const updatedBooks = books.map((book) => {
      if (book.id === editingId) {
        return {
          ...book,
          title,
          author,
          genre,
        };
      }
      return book;
    });

    setBooks(updatedBooks);
    setEditingId(null);
    clearFields();
  };

  // CLEAR INPUTS
  const clearFields = () => {
    setTitle('');
    setAuthor('');
    setGenre('');
  };

  // RENDER BOOK ITEM
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
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editBook(item)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteBook(item.id)}
        >
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
        <Text style={styles.heading}>📚 Book Manager</Text>
        <Text style={styles.subHeading}>
          Simple React Native CRUD Application
        </Text>
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
          <TouchableOpacity
            style={styles.updateButton}
            onPress={updateBook}
          >
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
          <Text style={styles.emptyText}>
            No books added yet 📖
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  header: {
    backgroundColor: '#4A6CF7',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 20,
  },

  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },

  subHeading: {
    fontSize: 14,
    color: '#E0E7FF',
    textAlign: 'center',
    marginTop: 5,
  },

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
  },

  addButton: {
    backgroundColor: '#4A6CF7',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },

  updateButton: {
    backgroundColor: '#FF9800',
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
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    width: '48%',
    borderRadius: 10,
    alignItems: 'center',
  },

  deleteButton: {
    backgroundColor: '#F44336',
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