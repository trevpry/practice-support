import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';

const ApiTest = () => {
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'http://localhost:5001/api';

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/users`);
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/posts`);
            if (!response.ok) throw new Error('Failed to fetch posts');
            const data = await response.json();
            setPosts(data);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const createSampleUser = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'John Doe',
                    email: `john.doe.${Date.now()}@example.com`,
                    password: 'password123'
                })
            });
            if (!response.ok) throw new Error('Failed to create user');
            await fetchUsers(); // Refresh the list
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">API Integration Test</h2>
            
            {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded mb-4">
                    Error: {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Users Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Users</h3>
                        <div className="space-x-2">
                            <Button onClick={fetchUsers} disabled={loading} size="sm">
                                {loading ? 'Loading...' : 'Fetch Users'}
                            </Button>
                            <Button onClick={createSampleUser} disabled={loading} size="sm" variant="outline">
                                Add Sample User
                            </Button>
                        </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                        {users.length === 0 ? (
                            <p className="text-muted-foreground">No users found. Try creating one!</p>
                        ) : (
                            <ul className="space-y-2">
                                {users.map(user => (
                                    <li key={user.id} className="border-b pb-2">
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Created: {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Posts Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Posts</h3>
                        <Button onClick={fetchPosts} disabled={loading} size="sm">
                            {loading ? 'Loading...' : 'Fetch Posts'}
                        </Button>
                    </div>
                    
                    <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                        {posts.length === 0 ? (
                            <p className="text-muted-foreground">No posts found.</p>
                        ) : (
                            <ul className="space-y-2">
                                {posts.map(post => (
                                    <li key={post.id} className="border-b pb-2">
                                        <div className="font-medium">{post.title}</div>
                                        <div className="text-sm text-muted-foreground">{post.content}</div>
                                        <div className="text-xs text-muted-foreground">
                                            By: {post.author?.name} | Created: {new Date(post.createdAt).toLocaleDateString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">API Endpoints Available:</h4>
                <ul className="text-sm space-y-1">
                    <li><code className="bg-background px-2 py-1 rounded">GET /api/users</code> - Fetch all users</li>
                    <li><code className="bg-background px-2 py-1 rounded">POST /api/users</code> - Create a new user</li>
                    <li><code className="bg-background px-2 py-1 rounded">GET /api/posts</code> - Fetch all posts</li>
                    <li><code className="bg-background px-2 py-1 rounded">POST /api/posts</code> - Create a new post</li>
                    <li><code className="bg-background px-2 py-1 rounded">GET /api/health</code> - API health check</li>
                </ul>
            </div>
        </div>
    );
};

export default ApiTest;
