async function getAreaId() {
  const TEST_API_KEY = 'biteship_test.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZHJlc3MiLCJ1c2VySWQiOiI2OWZlNzU1NjBiNjRjYTU5OTkwZDQ0NjYiLCJpYXQiOjE3NzgzMTkwOTJ9.F_9jPlAXnqvPC7KpIAnaaEikpU3ljnfoK63tzPkyVc4';
  
  console.log('🔍 Mencari Area ID untuk Purbaratu, Tasikmalaya...');
  
  try {
    const response = await fetch('https://api.biteship.com/v1/maps/areas?countries=ID&input=Purbaratu&type=single', {
      method: 'GET',
      headers: {
        'Authorization': TEST_API_KEY
      }
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

getAreaId();
