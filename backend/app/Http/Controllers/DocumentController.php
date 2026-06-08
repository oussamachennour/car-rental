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
     *
     * - Manager → all documents (with optional filters)
     * - Client  → only their own documents
     */
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $query = Document::with('user:id,name,email,avatar')->latest();

        // ✅ Role-based filter: clients only see their own documents
        if ($authUser->role !== 'manager') {
            $query->where('user_id', $authUser->id);
        } else {
            // Manager: optional user_id filter from query string
            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $documents = $query->get()->map(function ($doc) {
            // ✅ Safe formatted_size: compute it here instead of relying on
            //    an accessor that may not be appended to JSON serialization
            $bytes = $doc->file_size ?? 0;
            if ($bytes >= 1024 * 1024) {
                $doc->formatted_size = round($bytes / (1024 * 1024), 1) . ' MB';
            } elseif ($bytes >= 1024) {
                $doc->formatted_size = round($bytes / 1024, 1) . ' KB';
            } else {
                $doc->formatted_size = $bytes . ' B';
            }
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
     *
     * Upload a new document. Accepts multipart/form-data.
     *
     * ✅ Fix 1: user_id is now taken from the authenticated user automatically
     *           (no longer required in the request body — avoids 422 for new users)
     * ✅ Fix 2: user_id in request body is still accepted but only if the caller
     *           is a manager (allows manager to upload on behalf of a client)
     */
    public function store(Request $request): JsonResponse
    {
        $authUser = $request->user();

        // Determine which user_id to use
        if ($authUser->role === 'manager' && $request->filled('user_id')) {
            // Manager uploading on behalf of a client
            $userId = (int) $request->input('user_id');
        } else {
            // ✅ Default: always use the authenticated user's id
            //    This is the key fix — new users no longer get a 422
            $userId = $authUser->id;
        }

        $request->validate([
            'type' => ['required', Rule::in(['drivers_license', 'passport', 'id_card', 'proof_of_address'])],
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $file     = $request->file('file');
        $fileName = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
        $path     = $file->storeAs("documents/{$userId}", $fileName, 'public');

        $document = Document::create([
            'user_id'   => $userId,
            'type'      => $request->input('type'),
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'status'    => 'pending',
        ]);

        // Notify managers of the upload
        $uploader = User::find($userId);
        Notification::notifyManagers(
            'document',
            'Document Uploaded',
            "{$uploader->name} uploaded a new document: {$request->input('type')}.",
            ['document_id' => $document->id, 'user_id' => $userId]
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

        // verified_by defaults to the authenticated manager if not provided
        $verifiedBy = $request->input('verified_by', $request->user()->id);

        $document->verify($verifiedBy);

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
     */
    public function destroy(int $id): JsonResponse
    {
        $document = Document::findOrFail($id);

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
