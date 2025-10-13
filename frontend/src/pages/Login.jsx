export default function Login() {
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">登录</h2>
      <input className="border rounded p-2 w-full mb-3" placeholder="用户名" />
      <input className="border rounded p-2 w-full mb-3" type="password" placeholder="密码" />
      <button className="w-full bg-blue-600 text-white py-2 rounded">登录</button>
    </div>
  )
}