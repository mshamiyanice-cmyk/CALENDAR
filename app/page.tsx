"use client"

import { useState, useEffect } from "react"
import { EventManager, type Event, type StickyNote } from "@/components/ui/event-manager"
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function EventManagerDemo() {
  const [events, setEvents] = useState<Event[]>([])
  const [notes, setNotes] = useState<StickyNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen to real-time updates from Firebase
    const unsubscribe = onSnapshot(collection(db, "calendar-details"), (snapshot) => {
      const formattedEvents = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data()
        
        const parseDate = (val: any) => {
          if (!val) return new Date()
          if (typeof val.toDate === 'function') return val.toDate()
          const parsed = new Date(val)
          return isNaN(parsed.getTime()) ? new Date() : parsed
        }

        return {
          id: docSnapshot.id,
          title: data.title || "Untitled Event",
          description: data.description,
          // Safely parser native Firestore Timestamps AND manual string inputs
          startTime: parseDate(data.startTime),
          endTime: parseDate(data.endTime),
          color: data.color || "blue",
          category: data.category || "Task",
          attendees: Array.isArray(data.attendees) ? data.attendees : (data.attendees ? [data.attendees] : []),
          tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
        } as Event
      })
      
      setEvents(formattedEvents)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching events:", error)
      setLoading(false)
    })

    const unsubscribeNotes = onSnapshot(collection(db, "calendar-notes"), (snapshot) => {
      const formattedNotes = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data()
        
        const parseDate = (val: any) => {
          if (!val) return undefined
          if (typeof val.toDate === 'function') return val.toDate()
          const parsed = new Date(val)
          return isNaN(parsed.getTime()) ? undefined : parsed
        }

        return {
          id: docSnapshot.id,
          content: data.content || "",
          color: data.color || "yellow",
          pinnedDate: parseDate(data.pinnedDate),
          pinnedMonth: data.pinnedMonth,
          pinnedYear: data.pinnedYear,
        } as StickyNote
      })
      setNotes(formattedNotes)
    }, (error) => console.error("Error fetching notes:", error))

    return () => {
      unsubscribe()
      unsubscribeNotes()
    }
  }, [])

  const handleCreateEvent = async (eventData: Omit<Event, "id">) => {
    try {
      const payload: any = {
        ...eventData,
        startTime: Timestamp.fromDate(eventData.startTime),
        endTime: Timestamp.fromDate(eventData.endTime)
      };

      // Firestore crashes if you try to save 'undefined' fields.
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      await addDoc(collection(db, "calendar-details"), payload)
    } catch (error) {
      console.error("Error adding document: ", error)
    }
  }

  const handleUpdateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      const updateData: any = { ...eventData }
      if (updateData.startTime) updateData.startTime = Timestamp.fromDate(updateData.startTime)
      if (updateData.endTime) updateData.endTime = Timestamp.fromDate(updateData.endTime)
      
      // Clean undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await updateDoc(doc(db, "calendar-details", id), updateData)
    } catch (error) {
      console.error("Error updating document: ", error)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, "calendar-details", id))
    } catch (error) {
      console.error("Error deleting document: ", error)
    }
  }

  const handleCreateNote = async (noteData: Omit<StickyNote, "id">) => {
    try {
      const payload: any = { ...noteData }
      if (payload.pinnedDate) payload.pinnedDate = Timestamp.fromDate(payload.pinnedDate)
      
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) delete payload[key];
      });
      await addDoc(collection(db, "calendar-notes"), payload)
    } catch (error) { console.error("Error adding note: ", error) }
  }

  const handleUpdateNote = async (id: string, noteData: Partial<StickyNote>) => {
    try {
      const payload: any = { ...noteData }
      if (payload.pinnedDate) payload.pinnedDate = Timestamp.fromDate(payload.pinnedDate)
      
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) delete payload[key];
      });
      await updateDoc(doc(db, "calendar-notes", id), payload)
    } catch (error) { console.error("Error updating note: ", error) }
  }

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, "calendar-notes", id))
    } catch (error) { console.error("Error deleting note: ", error) }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 pb-24 min-h-screen">
       <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Circular Logo */}
        <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-full border-2 bg-white flex items-center justify-center border-primary/20 shadow-md">
          <img 
            src="/logo.png" 
            alt="BYOSE TECH Logo" 
            className="h-full w-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary uppercase">BYOSE TECH</h1>
          <p className="text-muted-foreground mt-2">Manage all your company's upcoming events, meetings, and activities.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p>Syncing calendar with secure datastore...</p>
        </div>
      ) : (
        <EventManager
          events={events}
          notes={notes}
          onEventCreate={handleCreateEvent}
          onEventUpdate={handleUpdateEvent}
          onEventDelete={handleDeleteEvent}
          onNoteCreate={handleCreateNote}
          onNoteUpdate={handleUpdateNote}
          onNoteDelete={handleDeleteNote}
          categories={["Event", "Meeting", "Task", "Reminder", "Personal"]}
          availableTags={["Important", "Urgent", "Work", "Personal", "Team", "Client"]}
          defaultView="month"
        />
      )}
    </div>
  )
}
