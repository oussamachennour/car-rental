<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class DocumentController extends Controller
{
    /**
     * GET /api/documents
     * List all documents, optionally filtered by user or status.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Document::with('user:id,name,email,avatar')->latest();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $documents = $query->get()->map(function ($doc) {
            $doc->formatted_size = $doc->formatted_size;
            return $doc;
        });

        return response()->json([
            'success' => true,
            'data'    => $documents,
            'total'   => $documents->count(),
        ]);
    }

    /**
     * POST /api/documents
     * Upload a new document (driver's license, ID, etc.).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id'  => 'required|exists:users,id',
            'type'     => ['required', Rule::in(['drivers_license', 'passport', 'id_card', 'proof_of_address'])],
            'file'     => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $file     = $request->file('file');
        $fileName = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
        $path     = $file->storeAs("documents/{$validated['user_id']}", $fileName, 'public');

        $document = Document::create([
            'user_id'   => $validated['user_id'],
            'type'      => $validated['type'],
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'status'    => 'pending',
        ]);

        // Notify managers of the upload
        $user = User::find($validated['user_id']);
        Notification::notifyManagers(
            'document',
            'Document Uploaded',
            "{$user->name} uploaded a new document: {$validated['type']}.",
            ['document_id' => $document->id, 'user_id' => $user->id]
        );

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully. Pending verification.',
            'data'    => $document->load('user:id,name,email'),
        ], 201);
    }

    /**
     * PATCH /api/documents/{id}/verify
     * Verify a document (manager only).
     */
    public function verify(Request $request, int $id): JsonResponse
    {
        $document = Document::with('user')->findOrFail($id);

        $validated = $request->validate([
            'verified_by' => 'required|exists:users,id',
        ]);

        $document->verify($validated['verified_by']);

        // Notify the client
        Notification::create([
            'user_id' => $document->user_id,
            'type'    => 'document',
            'title'   => 'Document Verified',
            'message' => "Your {$document->type} has been verified successfully.",
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document verified.',
            'data'    => $document->fresh(),
        ]);
    }

    /**
     * PATCH /api/documents/{id}/reject
     * Reject a document with a reason.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $document = Document::with('user')->findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $document->reject($validated['reason']);

        // Notify the client
        Notification::create([
            'user_id' => $document->user_id,
            'type'    => 'document',
            'title'   => 'Document Rejected',
            'message' => "Your {$document->type} was rejected: {$validated['reason']}",
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document rejected.',
            'data'    => $document->fresh(),
        ]);
    }

    /**
     * DELETE /api/documents/{id}
     * Delete a document and its stored file.
     */
    public function destroy(int $id): JsonResponse
    {
        $document = Document::findOrFail($id);

        // Remove file from storage
        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document deleted.',
        ]);
    }
}
