import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="p-4">
      <p class="text-gray-800">
        OI.
      </p>
      <div class="bg-gray-300 p-4 rounded-lg">
        <button class="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600">Click me</button>
      </div>
    </main>
    <footer class="bg-blue-500 text-white p-4">
      <p>Copyright ©2025 My Project</p>
    </footer>
`